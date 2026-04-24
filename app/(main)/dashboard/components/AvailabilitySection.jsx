/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GrayTitle } from "@/components/reusables";
import { setAvailability } from "@/actions/dashboard";
import useFetch from "@/hooks/use-fetch";
import { Clock } from "lucide-react";

export default function AvailabilitySection({ initial }) {
  const [startTime, setStartTime] = useState(
    initial?.startTime
      ? new Date(initial.startTime).toTimeString().slice(0, 5)
      : ""
  );
  const [endTime, setEndTime] = useState(
    initial?.endTime ? new Date(initial.endTime).toTimeString().slice(0, 5) : ""
  );
  const [saved, setSaved] = useState(false);

  const { data, loading, error, fn: saveFn } = useFetch(setAvailability);

  useEffect(() => {
    if (data?.success) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [data]);

  const toISO = (time) => {
    const [h, m] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const handleSave = () => {
    if (!startTime || !endTime) return;
    saveFn({ startTime: toISO(startTime), endTime: toISO(endTime) });
  };

  const hasWindow = startTime && endTime;
  const duration = hasWindow
    ? (() => {
        const [sh, sm] = startTime.split(":").map(Number);
        const [eh, em] = endTime.split(":").map(Number);
        const diff = eh * 60 + em - (sh * 60 + sm);
        if (diff <= 0) return null;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
      })()
    : null;

  return (
    <section className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 flex flex-col gap-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-lg mb-4">
            <Clock size={18} className="text-amber-400" />
          </span>
          <h2 className="font-serif text-xl tracking-tight">
            <GrayTitle>Daily availability window</GrayTitle>
          </h2>
          <p className="text-xs text-stone-500 font-light mt-1">
            Interviewees can book within this window every day.
          </p>
        </div>

        {initial && (
          <Badge
            variant="outline"
            className="shrink-0 border-green-500/20 bg-green-500/10 text-green-400"
          >
            Active
          </Badge>
        )}
      </div>

      <div className="h-px bg-white/5" />

      {/* Time inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-stone-400 text-xs">Start time</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-[#141417] border-white/10 text-stone-100"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-stone-400 text-xs">End time</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-[#141417] border-white/10 text-stone-100"
          />
        </div>
      </div>

      {/* Duration pill */}
      {duration && (
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="border-amber-400/20 bg-amber-400/5 text-amber-400"
          >
            {duration} window
          </Badge>
          <span className="text-xs text-stone-600">
            Interviewees see this as your open booking range
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error?.message || error}</p>
      )}

      {/* Save */}
      <Button
        variant="gold"
        disabled={!hasWindow || loading}
        onClick={handleSave}
        className="self-start"
      >
        {loading
          ? "Saving…"
          : saved
          ? "✓ Saved"
          : initial
          ? "Update window"
          : "Set availability"}
      </Button>
    </section>
  );
}
