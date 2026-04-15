"use client";

import { replaceOpeningHours } from "@radar-domace/api";
import type { OpeningHour } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../../lib/supabase-browser";
import { openingHoursSchema } from "../../lib/validation/provider";

const weekdayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const buildInitialHours = (hours: OpeningHour[]) =>
  weekdayLabels.map((_, dayOfWeek) => {
    const existing = hours.find((entry) => entry.dayOfWeek === dayOfWeek);
    return {
      dayOfWeek,
      opensAt: existing?.opensAt || "08:00",
      closesAt: existing?.closesAt || "16:00",
      isClosed: existing?.isClosed ?? true,
    };
  });

export const OpeningHoursEditor = ({ providerId, openingHours }: { providerId: string; openingHours: OpeningHour[] }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hours, setHours] = useState(buildInitialHours(openingHours));
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const updateEntry = (
    dayOfWeek: number,
    patch: Partial<{ opensAt: string; closesAt: string; isClosed: boolean }>,
  ) => {
    setHours((current) =>
      current.map((entry) => (entry.dayOfWeek === dayOfWeek ? { ...entry, ...patch } : entry)),
    );
  };

  const save = () => {
    const parsed = openingHoursSchema.safeParse({ hours });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Opening hours are invalid.");
      setFeedback(null);
      return;
    }

    startTransition(async () => {
      setError(null);
      setFeedback(null);
      const client = createWebBrowserSupabaseClient();
      const result = await replaceOpeningHours(client, {
        providerId,
        hours: parsed.data.hours.map((entry) => ({
          ...entry,
          opensAt: entry.isClosed ? null : entry.opensAt,
          closesAt: entry.isClosed ? null : entry.closesAt,
        })),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setFeedback("Opening hours saved.");
      router.refresh();
    });
  };

  return (
    <div className="stack-lg">
      <div className="note">Keep this schedule simple for MVP. If your times change often, update the affected day and save again.</div>

      <div className="hours-grid">
        {hours.map((entry) => (
          <div key={entry.dayOfWeek} className="hours-row">
            <div>
              <strong>{weekdayLabels[entry.dayOfWeek]}</strong>
            </div>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={entry.isClosed}
                onChange={(event) => updateEntry(entry.dayOfWeek, { isClosed: event.target.checked })}
              />
              Closed
            </label>
            <input
              type="time"
              value={entry.opensAt ?? "08:00"}
              disabled={entry.isClosed}
              onChange={(event) => updateEntry(entry.dayOfWeek, { opensAt: event.target.value })}
            />
            <input
              type="time"
              value={entry.closesAt ?? "16:00"}
              disabled={entry.isClosed}
              onChange={(event) => updateEntry(entry.dayOfWeek, { closesAt: event.target.value })}
            />
          </div>
        ))}
      </div>

      <div className="inline-actions">
        <button className="primary-button" type="button" onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : "Save opening hours"}
        </button>
      </div>

      {error ? <p className="field-error">{error}</p> : null}
      {feedback ? <p className="field-success">{feedback}</p> : null}
    </div>
  );
};
