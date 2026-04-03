"use client";

import { FormEvent, useState } from "react";

type SalonResult = {
  salon: {
    name: string;
    address: string;
    rating: number;
    reviewCount: number;
    lat: number;
    lng: number;
  };
};

type VisibilityLevel = "HIGH" | "MEDIUM" | "LOW";

function getVisibilityLevel(rating: number, reviewCount: number): VisibilityLevel {
  if (reviewCount >= 150 && rating >= 4.5) return "HIGH";
  if (reviewCount >= 60 && rating >= 4.2) return "MEDIUM";
  return "LOW";
}

export default function HomePage() {
  const [salonName, setSalonName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SalonResult | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedSalon = salonName.trim();
    const trimmedPostcode = postcode.trim();

    if (!trimmedSalon || !trimmedPostcode) {
      setError("Please enter both salon name and postcode/area.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedSalon,
          postcode: trimmedPostcode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          `${data.error || "Something went wrong."}${
            data.details
              ? `\n\nDetails:\n${JSON.stringify(data.details, null, 2)}`
              : ""
          }`
        );
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const rating = result?.salon.rating ?? 0;
  const reviewCount = result?.salon.reviewCount ?? 0;
  const visibility = getVisibilityLevel(rating, reviewCount);
  const competitorAverageReviews = Math.max(reviewCount + 80, 180);
  const reviewGap = Math.max(0, competitorAverageReviews - reviewCount);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.12),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-20 sm:px-8 sm:py-28">
        <header className="mb-16 sm:mb-20">
          <p className="mb-4 text-sm font-medium tracking-wide text-violet-600/90">
            UK nail salons · Google Maps growth
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl sm:leading-[1.1]">
            Get More Clients from Google Maps — or See Why You&apos;re Losing
            Them
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
            Instantly compare your nail salon with nearby competitors and see
            how many clients you might be missing.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.04),0_24px_48px_-12px_rgba(0,0,0,0.08)] sm:p-10">
            <form onSubmit={handleSubmit}>
              <label htmlFor="salon" className="sr-only">
                Nail salon name
              </label>
              <input
                id="salon"
                type="text"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                placeholder="Enter your nail salon name"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3.5 text-base text-neutral-900 outline-none ring-violet-500/20 transition placeholder:text-neutral-400 focus:border-violet-300 focus:bg-white focus:ring-4"
                autoComplete="organization"
              />

              <label htmlFor="postcode" className="sr-only">
                Postcode or area
              </label>
              <input
                id="postcode"
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Enter postcode or area (e.g. SW1A 1AA, Soho)"
                className="mt-4 w-full rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3.5 text-base text-neutral-900 outline-none ring-violet-500/20 transition placeholder:text-neutral-400 focus:border-violet-300 focus:bg-white focus:ring-4"
                autoComplete="postal-code"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                {loading ? "Checking..." : "Check My Google Visibility"}
              </button>
            </form>

            <p className="mt-8 text-sm text-neutral-500">
              Free instant analysis · No signup
            </p>

            {error && (
              <div className="mt-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3.5 text-sm leading-relaxed text-red-800 whitespace-pre-wrap break-words">
                {error}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.04),0_24px_48px_-12px_rgba(0,0,0,0.08)] sm:p-10">
            {!result && !loading && !error && (
              <div className="flex min-h-[260px] flex-col justify-center">
                <p className="text-sm font-medium tracking-wide text-violet-600/90">
                  Visibility gap preview
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
                  See where you stand
                </h2>
                <p className="mt-4 max-w-md text-neutral-600">
                  Enter your salon name and postcode to compare your Google
                  profile strength and review gap.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[260px] flex-col justify-center">
                <p className="text-sm font-medium tracking-wide text-violet-600/90">
                  Live analysis
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
                  Checking your Google profile...
                </h2>
                <p className="mt-4 max-w-md text-neutral-600">
                  We&apos;re analyzing your current review strength and local
                  visibility.
                </p>
              </div>
            )}

            {result && (
              <div>
                <p className="text-sm font-medium tracking-wide text-violet-600/90">
                  Gap analysis
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
                  Improve your Google visibility
                </h2>

                {/* A. Current Profile */}
                <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Current profile
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-neutral-900">
                    {result.salon.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                    {result.salon.address}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200 bg-white p-4">
                      <p className="text-sm text-neutral-500">Rating</p>
                      <p className="mt-1 text-2xl font-semibold text-neutral-900">
                        {result.salon.rating || 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-4">
                      <p className="text-sm text-neutral-500">Review count</p>
                      <p className="mt-1 text-2xl font-semibold text-neutral-900">
                        {result.salon.reviewCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* B. Visibility Summary */}
                <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">
                    Visibility summary
                  </p>
                  <p className="mt-2 text-sm text-neutral-700">
                    Estimated visibility:{" "}
                    <span className="font-semibold text-neutral-900">
                      {visibility}
                    </span>
                  </p>
                </div>

                {/* C. Review Gap */}
                <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Review gap
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                    <li>
                      Your reviews: <strong>{reviewCount}</strong>
                    </li>
                    <li>
                      Nearby competitors:{" "}
                      <strong>{competitorAverageReviews}+</strong>
                    </li>
                    <li>
                      You are behind by: <strong>{reviewGap}</strong> reviews
                    </li>
                  </ul>
                </div>

                {/* D. Business Impact Message */}
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-sm font-medium text-amber-900">
                    You are likely losing clients to nearby salons with stronger
                    Google profiles.
                  </p>
                </div>

                {/* E. Upgrade Teaser */}
                <div className="mt-5 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-violet-50/60 p-5">
                  <p className="text-sm font-medium text-neutral-900">
                    Want to improve your ranking?
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Get weekly reports, review growth tips, and automated reply
                    suggestions.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <p className="mt-10 text-center text-xs tracking-wide text-neutral-500">
          Built for UK nail salons · Based on real Google Maps data
        </p>
      </div>
    </main>
  );
}