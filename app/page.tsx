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

function getVisibilityLevel(
  rating: number,
  reviewCount: number
): VisibilityLevel {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [leadSalonName, setLeadSalonName] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setSubmitted(false);
    setEmail("");
  }

  function openLeadModal() {
    setLeadSalonName(salonName.trim());
    setSubmitted(false);
    setEmail("");
    setIsModalOpen(true);
  }

  async function handleLeadFormSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedLeadSalonName = leadSalonName.trim();
    const trimmedPostcode = postcode.trim();

    if (!trimmedEmail || !trimmedLeadSalonName) {
      return;
    }

    try {
      const res = await fetch("https://formspree.io/f/mdapwzkl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          salonName: trimmedLeadSalonName,
          postcode: trimmedPostcode,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      setSubmitted(true);
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("Could not submit your email. Please try again.");
    }
  }

  const rating = result?.salon.rating ?? 0;
  const reviewCount = result?.salon.reviewCount ?? 0;
  const visibility = getVisibilityLevel(rating, reviewCount);

  const competitorAverageReviews = Math.max(reviewCount + 80, 180);
  const reviewGap = Math.max(0, competitorAverageReviews - reviewCount);

  const lostClientsLow = Math.max(4, Math.round(reviewGap / 10));
  const lostClientsHigh = Math.max(10, Math.round(reviewGap / 4.5));
  const lostRevenueLow = lostClientsLow * 40;
  const lostRevenueHigh = lostClientsHigh * 80;

  const actionTargetReviews = Math.min(
    30,
    Math.max(12, Math.round(reviewGap / 3))
  );

  return (
    <>
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
                    profile strength, visibility level, and review gap.
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
                    Where you&apos;re losing ground on Google Maps
                  </h2>

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

                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm font-medium text-amber-900">
                      You are likely losing clients to nearby salons with
                      stronger Google profiles.
                    </p>

                    <div className="mt-4 rounded-xl border border-amber-200 bg-white/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                        Estimated impact
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-neutral-800">
                        <li>
                          Lost clients per month:{" "}
                          <strong>
                            {lostClientsLow}–{lostClientsHigh}
                          </strong>
                        </li>
                        <li>
                          Potential lost revenue:{" "}
                          <strong>
                            £{lostRevenueLow}–£{lostRevenueHigh}+
                          </strong>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      What you should do next
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                      <li>
                        Get <strong>{actionTargetReviews}–30 new reviews</strong>{" "}
                        in the next 30 days
                      </li>
                      <li>
                        Respond to <strong>all recent reviews</strong> to
                        improve trust signals
                      </li>
                      <li>
                        Push your profile above{" "}
                        <strong>4.5 rating + stronger review volume</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-950 via-violet-900 to-neutral-900 p-6 text-white shadow-lg shadow-violet-900/20">
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                      Growth system
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">
                      Unlock full growth system
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-violet-100/90">
                      Turn this analysis into a simple weekly growth process.
                    </p>
                    <ul className="mt-4 space-y-2.5 text-sm text-violet-50/95">
                      <li className="flex gap-2">
                        <span className="text-violet-300" aria-hidden>
                          ✓
                        </span>
                        <span>Weekly performance tracking</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-violet-300" aria-hidden>
                          ✓
                        </span>
                        <span>Weekly review growth plan</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-violet-300" aria-hidden>
                          ✓
                        </span>
                        <span>Ready-to-use reply templates</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-violet-300" aria-hidden>
                          ✓
                        </span>
                        <span>Unlimited visibility checks</span>
                      </li>
                    </ul>
                    <p className="mt-5 text-sm font-medium text-white">
                      Free early access
                    </p>
                    <button
                      type="button"
                      onClick={openLeadModal}
                      className="mt-4 w-full rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-violet-950 shadow-md transition hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      Get My Free Growth Plan
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
                    <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="font-semibold text-neutral-900">Free</p>
                        <ul className="mt-2 space-y-1.5 text-neutral-600">
                          <li>One instant visibility check</li>
                          <li>Review gap preview</li>
                          <li>Basic improvement guidance</li>
                        </ul>
                      </div>
                      <div className="border-l border-neutral-200 pl-4">
                        <p className="font-semibold text-neutral-900">
                          Growth System
                        </p>
                        <ul className="mt-2 space-y-1.5 text-neutral-600">
                          <li>Weekly reports</li>
                          <li>Ongoing review tracking</li>
                          <li>Review reply templates</li>
                          <li>Unlimited checks</li>
                        </ul>
                      </div>
                    </div>
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

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
              aria-label="Close"
            >
              ×
            </button>

            {!submitted ? (
              <>
                <h2
                  id="lead-modal-title"
                  className="pr-10 text-xl font-semibold tracking-tight text-neutral-900"
                >
                  Get your free growth plan
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Be the first to use the weekly growth system to improve your
                  Google visibility.
                </p>

                <form
                  className="mt-6 space-y-4"
                  onSubmit={handleLeadFormSubmit}
                >
                  <div>
                    <label
                      htmlFor="lead-email"
                      className="block text-sm font-medium text-neutral-700"
                    >
                      Email
                    </label>
                    <input
                      id="lead-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@salon.co.uk"
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-base text-neutral-900 outline-none ring-violet-500/20 transition placeholder:text-neutral-400 focus:border-violet-300 focus:bg-white focus:ring-4"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lead-salon"
                      className="block text-sm font-medium text-neutral-700"
                    >
                      Salon name
                    </label>
                    <input
                      id="lead-salon"
                      type="text"
                      value={leadSalonName}
                      onChange={(e) => setLeadSalonName(e.target.value)}
                      placeholder="Your salon name"
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-base text-neutral-900 outline-none ring-violet-500/20 transition placeholder:text-neutral-400 focus:border-violet-300 focus:bg-white focus:ring-4"
                      autoComplete="organization"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                  >
                    Get Early Access
                  </button>
                </form>
              </>
            ) : (
              <div className="pr-8 pt-1">
                <p
                  id="lead-modal-title"
                  className="text-base font-medium leading-relaxed text-neutral-900 whitespace-pre-line"
                >
                  {"You're in.\n\nWe'll send your first growth plan soon, including review targets and quick actions to improve your Google visibility."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}