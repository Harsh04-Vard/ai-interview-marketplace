// app/api/webhooks/stream/route.js

import { db } from "@/lib/prisma";

export async function POST(request) {
  const body = await request.json();
  const eventType = body.type;

  console.log(`\n[stream-webhook] ← Received event: ${eventType}`);

  if (
    eventType !== "call.transcription_ready" &&
    eventType !== "call.recording_ready"
  ) {
    console.log(`[stream-webhook] Ignoring event type: ${eventType}`);
    return Response.json({ ok: true });
  }

  const callCid = body.call_cid ?? "";
  const streamCallId = callCid.includes(":") ? callCid.split(":")[1] : callCid;

  if (!streamCallId) return Response.json({ ok: true });

  try {
    const booking = await db.booking.findUnique({
      where: { streamCallId },
      include: {
        interviewer: {
          select: { id: true, clerkUserId: true, name: true, categories: true },
        },
        interviewee: {
          select: { id: true, clerkUserId: true, name: true },
        },
        feedback: { select: { id: true } },
      },
    });

    if (!booking) return Response.json({ ok: true });

    // ───────── Recording ─────────
    if (eventType === "call.recording_ready") {
      const recordingUrl = body.call_recording?.url;
      if (!recordingUrl) return Response.json({ ok: true });

      await db.booking.update({
        where: { id: booking.id },
        data: { recordingUrl },
      });

      return Response.json({ ok: true });
    }

    // ───────── Transcription ─────────
    if (eventType === "call.transcription_ready") {
      if (booking.feedback) return Response.json({ ok: true });

      const transcriptUrl = body.call_transcription?.url;
      if (!transcriptUrl) return Response.json({ ok: true });

      // Download transcript
      const transcriptRes = await fetch(transcriptUrl);
      const transcriptText = await transcriptRes.text();

      const lines = transcriptText
        .trim()
        .split("\n")
        .map((l) => {
          try {
            return JSON.parse(l);
          } catch {
            return null;
          }
        })
        .filter((e) => e?.type === "speech");

      if (lines.length === 0) return Response.json({ ok: true });

      const speakerMap = {
        [booking.interviewer.clerkUserId]:
          booking.interviewer.name ?? "Interviewer",
        [booking.interviewee.clerkUserId]:
          booking.interviewee.name ?? "Interviewee",
      };

      const transcript = lines
        .map((l) => `${speakerMap[l.speaker_id] ?? l.speaker_id}: ${l.text}`)
        .join("\n");

      const categories =
        booking.interviewer.categories?.join(", ") ?? "General";

      const prompt = `
You are an expert technical interviewer evaluating a mock interview.

Interview categories: ${categories}
Interviewer: ${booking.interviewer.name}
Candidate: ${booking.interviewee.name}

TRANSCRIPT:
${transcript}

Return ONLY JSON:
{
  "summary": "...",
  "technical": "...",
  "communication": "...",
  "problemSolving": "...",
  "recommendation": "...",
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "overallRating": "POOR or AVERAGE or GOOD or EXCELLENT"
}
`;

      // 🔥 GROQ API
      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        }
      );

      const groqData = await groqRes.json();

      const raw = groqData.choices?.[0]?.message?.content
        ?.replace(/^```json|^```|```$/gm, "")
        ?.trim();

      if (!raw) {
        console.error("Groq error:", groqData);
        throw new Error("AI failed");
      }

      let feedbackData;
      try {
        feedbackData = JSON.parse(raw);
      } catch (err) {
        console.error("JSON parse error:", raw);
        throw new Error("Invalid AI response");
      }

      await db.$transaction([
        db.feedback.upsert({
          where: { bookingId: booking.id },
          create: {
            bookingId: booking.id,
            ...feedbackData,
          },
          update: {},
        }),
        db.booking.update({
          where: { id: booking.id },
          data: { status: "COMPLETED" },
        }),
      ]);

      return Response.json({ ok: true });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return Response.json({ ok: true });
  }
}