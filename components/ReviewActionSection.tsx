"use client";

import { useState } from "react";
import { buildReviewMessages } from "@/lib/reviewMessages";

type Props = {
  salonName: string;
};

export function ReviewActionSection({ salonName }: Props) {
  const [open, setOpen] = useState(false);
  const messages = buildReviewMessages(salonName);

  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-violet-50/80 via-white to-fuchsia-50/50 p-8 shadow-sm sm:p-10">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        Get More Reviews This Week
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-600">
        Use a short, polite follow-up after appointments. Tap below to copy-ready
        templates.
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
      >
        {open ? "Hide messages" : "Generate Review Request Message"}
      </button>

      {open && (
        <ul className="mt-8 space-y-6">
          <li className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              WhatsApp
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {messages.whatsapp}
            </p>
          </li>
          <li className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              SMS
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {messages.sms}
            </p>
          </li>
          <li className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-600">
              Friendly casual
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {messages.casual}
            </p>
          </li>
        </ul>
      )}
    </section>
  );
}
