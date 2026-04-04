"use client";

import React, { useMemo, useState } from "react";

type VisibilityLevel = "HIGH" | "MEDIUM" | "LOW";

type AuditResult = {
  salonName: string;
  rating: number;
  reviewCount: number;
  visibilityLevel: VisibilityLevel;
  reviewGap: number;
  lostClientsPerMonth: number;
  lostRevenuePerMonth: number;
  competitorsReviewAverage: number;
};

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function getVisibilityStyles(level: VisibilityLevel) {
  switch (level) {
    case "HIGH":
      return "bg-green-100 text-green-800 border-green-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "LOW":
    default:
      return "bg-red-100 text-red-800 border-red-200";
  }
}

async function runAudit(input: {
  salonName: string;
  postcode: string;
}): Promise<AuditResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error("Failed to analyze salon");
  }

  return res.json();
}

export default function Page() {
  const [salonName, setSalonName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const isFormValid = useMemo(() => {
    return salonName.trim().length > 1 && postcode.trim().length > 2;
  }, [salonName, postcode]);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");

    try {
      const data = await runAudit({
        salonName: salonName.trim(),
        postcode: postcode.trim(),
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Could not analyze this salon right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                Free Google visibility check for UK nail salons
              </div>

              <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">
                You might be losing clients every day on Google.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-neutral-600">
                Most nail salons rely on platforms like Treatwell and pay high
                commissions while missing free clients already searching on
                Google.
              </p>

              <p className="mt-3 max-w-xl text-base leading-7 text-neutral-500">
                Check your salon in under 10 seconds and see if nearby
                competitors are taking bookings you should be getting.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold">Check my salon</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Enter your salon name and postcode.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleAnalyze}>
                <div>
                  <label
                    htmlFor="salonName"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    Salon name
                  </label>
                  <input
                    id="salonName"
                    type="text"
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    placeholder="e.g. Queen B Luxury Nail and Beauty Lounge"
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postcode"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    Postcode
                  </label>
                  <input
                    id="postcode"
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="e.g. SW1A 1AA"
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 uppercase outline-none transition focus:border-neutral-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full rounded-2xl bg-neutral-900 px-5 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Analyzing..." : "Analyze now"}
                </button>

                {error ? (
                  <p className="text-sm text-red-600">{error}</p>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <section className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                  Audit result
                </p>
                <h3 className="mt-2 text-3xl font-bold">{result.salonName}</h3>
                <p className="mt-3 max-w-2xl text-neutral-600">
                  This means potential clients may be choosing other salons
                  before they even see you.
                </p>
              </div>

              <div
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getVisibilityStyles(
                  result.visibilityLevel
                )}`}
              >
                Your visibility: {result.visibilityLevel}
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Google rating"
                value={result.rating.toFixed(1)}
                subtext="Current public rating"
              />
              <MetricCard
                label="Review count"
                value={String(result.reviewCount)}
                subtext="Total Google reviews"
              />
              <MetricCard
                label="Estimated lost clients"
                value={`${result.lostClientsPerMonth}/month`}
                subtext="Potential clients choosing competitors"
                emphasize
              />
              <MetricCard
                label="Estimated lost revenue"
                value={currency.format(result.lostRevenuePerMonth)}
                subtext="Potential monthly revenue left on the table"
                emphasize
              />
            </div>

            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
              <h4 className="text-lg font-semibold">Why this is happening</h4>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
                <li>
                  Nearby salons have around{" "}
                  {result.competitorsReviewAverage} reviews on average.
                </li>
                <li>You are behind by about {result.reviewGap} reviews.</li>
                <li>
                  That makes it easier for clients to trust competitors first.
                </li>
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-8 md:pb-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <PricingCard
            title="Free audit"
            price="£0"
            description="Use the tool once to see your rating, review count, visibility level, and estimated lost revenue."
            features={[
              "1 free salon analysis",
              "Visibility level: HIGH / MEDIUM / LOW",
              "Estimated lost clients and revenue",
              "Basic competitor comparison",
            ]}
            cta="Start free"
            featured={false}
          />

          <PricingCard
            title="Google Client Recovery Plan"
            price="£49"
            description="Recover lost clients from Google and reduce reliance on paid platforms like Treatwell. One-time payment."
            features={[
              "Identify exactly how many clients you're losing (e.g. 10–25/month)",
              "Step-by-step plan to recover 10–20 additional clients from Google",
              "Close your review gap (+20–50 reviews over time)",
              "3 highest-impact actions to improve visibility within 2–4 weeks",
              "Simple system to reduce commission-based bookings",
              "Typical outcome: +£300–£800/month in additional revenue",
            ]}
            cta="Get the full plan"
            featured={true}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                Done-for-you service
              </p>
              <h3 className="mt-2 text-2xl font-bold">
                Google profile optimization — £99 one-time
              </h3>
              <p className="mt-2 max-w-3xl text-neutral-600">
                For salons that want help implementing the changes. We optimize
                your profile, sharpen your positioning, and give you a
                review-growth action plan.
              </p>
            </div>

            <button className="rounded-2xl bg-neutral-900 px-5 py-3 font-semibold text-white transition hover:bg-neutral-800">
              Ask about done-for-you
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  emphasize = false,
}: {
  label: string;
  value: string;
  subtext: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 ${
        emphasize
          ? "border-red-200 bg-red-50"
          : "border-neutral-200 bg-white"
      }`}
    >
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{subtext}</p>
    </div>
  );
}

function PricingCard({
  title,
  price,
  description,
  features,
  cta,
  featured,
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-sm md:p-8 ${
        featured
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p
            className={`mt-2 text-sm leading-6 ${
              featured ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            {description}
          </p>
        </div>

        {featured ? (
          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-900">
            Recommended
          </div>
        ) : null}
      </div>

      <p className="mt-6 text-4xl font-bold">{price}</p>

      <ul
        className={`mt-6 space-y-3 text-sm leading-6 ${
          featured ? "text-neutral-200" : "text-neutral-700"
        }`}
      >
        {features.map((feature) => (
          <li key={feature}>• {feature}</li>
        ))}
      </ul>

      <button
        className={`mt-8 w-full rounded-2xl px-5 py-3 font-semibold transition ${
          featured
            ? "bg-white text-neutral-900 hover:bg-neutral-100"
            : "bg-neutral-900 text-white hover:bg-neutral-800"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}