"use server";

import { currentUser } from "@clerk/nextjs/server";

const CATEGORY_PROMPTS = {
  FRONTEND: "React, JavaScript, CSS, performance, accessibility, browser APIs",
  BACKEND:
    "Node.js, REST APIs, databases, authentication, caching, scalability",
  FULLSTACK:
    "full-stack architecture, API design, state management, deployment",
  DSA: "data structures, algorithms, time complexity, problem solving",
  SYSTEM_DESIGN:
    "distributed systems, scalability, databases, microservices, caching",
  BEHAVIORAL:
    "leadership, teamwork, conflict resolution, career growth, STAR method",
  DEVOPS: "CI/CD, Docker, Kubernetes, cloud infrastructure, monitoring",
  MOBILE:
    "React Native, iOS/Android, performance, offline support, app lifecycle",
};

export const generateInterviewQuestions = async ({ category }) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  if (!category || !CATEGORY_PROMPTS[category]) {
    throw new Error("Invalid category");
  }

const prompt = `
You are a senior FAANG-level interviewer.

Generate EXACTLY 6 ${category} interview questions.

Rules:
- Mix EASY, MEDIUM, and HARD questions
- Focus on real interview patterns (not theory definitions)
- Include at least:
  • 2 problem-solving questions
  • 2 conceptual questions
  • 2 edge-case or optimization questions

For each question:
- Provide a concise but strong answer (2–4 sentences)
- Mention approach, not just definition

Return ONLY valid JSON:

[
  {
    "question": "string",
    "answer": "string"
  }
]

No explanation.
No markdown.
Only JSON.
`;

  const response = await fetch(
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

  const data = await response.json();

  console.log("Groq RAW:", data);

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    console.error("Groq full response:", data);
    throw new Error("AI returned empty response");
  }

  let clean = text.trim();

  clean = clean.replace(/^```json|^```|```$/gm, "").trim();

  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");

  if (start !== -1 && end !== -1) {
    clean = clean.substring(start, end + 1);
  }

  let questions;

  try {
    questions = JSON.parse(clean);
  } catch (err) {
    console.error("Raw AI response:", text);
    throw new Error("AI returned invalid format");
  }

  return { questions };
};