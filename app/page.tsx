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
      const payload = {
        name: trimmedSalon,
        postcode: trimmedPostcode,
      };

      console.log("Sending payload:", payload);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("API response:", data);

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
      console.error("Frontend error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
            Get More Nail Clients from Google Maps
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
            See how your nail salon compares to nearby competitors using real
            Google Places data.
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
                {loading ? "Analyzing..." : "Analyze My Salon"}
              </button>
            </form>

            <p className="mt-8 text-sm text-neutral-500">
              No sign-up · Real Google Places data via secure server API
            </p>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-wrap break-words">
                {error}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.04),0_24px_48px_-12px_rgba(0,0,0,0.08)] sm:p-10">
            {!result && !loading && !error && (
              <div className="flex min-h-[260px] flex-col justify-center">
                <p className="text-sm font-medium tracking-wide text-violet-600/90">
                  Live analysis preview
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
                  Your salon data will appear here
                </h2>
                <p className="mt-4 max-w-md text-neutral-600">
                  Enter a real salon name and postcode/area.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[260px] flex-col justify-center">
                <p className="text-sm font-medium tracking-wide text-violet-600/90">
                  Live analysis
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
                  Fetching your salon data...
                </h2>
              </div>
            )}

            {result && (
              <div>
                <p className="text-sm font-medium tracking-wide text-violet-600/90">
                  Salon overview
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
                  {result.salon.name}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {result.salon.address}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                    <p className="text-sm text-neutral-500">Google rating</p>
                    <p className="mt-2 text-3xl font-semibold text-neutral-900">
                      {result.salon.rating ?? "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                    <p className="text-sm text-neutral-500">Review count</p>
                    <p className="mt-2 text-3xl font-semibold text-neutral-900">
                      {result.salon.reviewCount ?? 0}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
                  <p className="text-sm text-violet-700">
                    Location coordinates
                  </p>
                  <p className="mt-2 text-sm text-neutral-700">
                    Lat: {result.salon.lat ?? "N/A"} · Lng:{" "}
                    {result.salon.lng ?? "N/A"}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}