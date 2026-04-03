"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReviewActionSection } from "@/components/ReviewActionSection";
import type { AnalyzeResponse } from "@/lib/types";

type Props = {
  salonName: string;
  area: string;
};

type UiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: AnalyzeResponse };

export function ResultsClient({ salonName, area }: Props) {
  const [state, setState] = useState<UiState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: "loading" });
      try {
        // 所有密钥相关调用都走服务端 /api/analyze，客户端不接触 Google Key。
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ salonName, area }),
        });
        const json = (await res.json()) as AnalyzeResponse & { error?: string };

        if (!res.ok) {
          throw new Error(
            json.error ||
              "We couldn't confidently find your salon. Please try a more specific business name and postcode."
          );
        }

        if (!cancelled) {
          setState({ status: "success", data: json });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              err instanceof Error
                ? err.message
                : "Something went wrong. Please try again.",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [salonName, area]);

  return (
    <main className="min-h-screen pb-24">
      <div className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 sm:px-8">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
          >
            ← Back
          </Link>
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Real analysis
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
        {state.status === "loading" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-16 shadow-sm">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-violet-100" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-600 border-r-fuchsia-400" />
            </div>
            <p className="mt-6 text-sm font-medium text-neutral-600">
              Analyzing Google Maps data...
            </p>
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-rose-900">Analysis unavailable</h1>
            <p className="mt-3 text-sm leading-relaxed text-rose-800">{state.message}</p>
          </div>
        )}

        {state.status === "success" && (
          <section className="space-y-8">
            <header>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                {state.data.salon.name}
              </h1>
              <p className="mt-2 text-sm text-neutral-600">{state.data.salon.address}</p>
            </header>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-neutral-500">Google rating</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {state.data.salon.rating.toFixed(1)}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-neutral-500">Review count</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {state.data.salon.reviewCount}
                </p>
              </div>
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
                <p className="text-sm text-violet-700">Ranking score</p>
                <p className="mt-1 text-2xl font-semibold text-violet-900">
                  {state.data.analysis.rankingScore}/100
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Competitor comparison
              </h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200/80">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="px-4 py-3 font-medium text-neutral-600">Salon</th>
                      <th className="px-4 py-3 font-medium text-neutral-600">Rating</th>
                      <th className="px-4 py-3 font-medium text-neutral-600">Reviews</th>
                      <th className="px-4 py-3 font-medium text-neutral-600">Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.data.competitors.map((item, idx) => (
                      <tr key={`${item.name}-${idx}`} className="border-b border-neutral-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-neutral-900">{item.name}</td>
                        <td className="px-4 py-3 text-neutral-700">{item.rating.toFixed(1)}</td>
                        <td className="px-4 py-3 text-neutral-700">{item.reviewCount}</td>
                        <td className="px-4 py-3 text-neutral-700">{item.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Gap analysis
              </h2>
              <p className="mt-3 text-neutral-700">{state.data.analysis.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li>
                  Average competitor reviews:{" "}
                  <strong>{state.data.analysis.averageCompetitorReviews}</strong>
                </li>
                <li>
                  Review gap: <strong>{state.data.analysis.reviewGap}</strong>
                </li>
              </ul>
            </section>

            <ReviewActionSection salonName={state.data.salon.name} />
          </section>
        )}
      </div>
    </main>
  );
}
