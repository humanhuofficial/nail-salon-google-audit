import { NextRequest, NextResponse } from "next/server";

type GooglePlace = {
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Incoming body:", body);

    // 前端现在传的是 salonName，不是 name
    const salonName = body?.salonName?.trim?.() || "";
    const postcode = body?.postcode?.trim?.() || "";

    if (!salonName || !postcode) {
      return NextResponse.json(
        { error: "Missing salon name or postcode." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Missing GOOGLE_MAPS_API_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    const query = `${salonName} ${postcode} UK nail salon`;
    console.log("Google query:", query);

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location",
        },
        body: JSON.stringify({
          textQuery: query,
        }),
      }
    );

    const rawText = await response.text();
    console.log("Raw Google response:", rawText);

    let data: { places?: GooglePlace[] } | null = null;

    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "Google returned non-JSON response.",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Google Places request failed.",
          details: data,
        },
        { status: 500 }
      );
    }

    if (!data?.places || data.places.length === 0) {
      return NextResponse.json(
        {
          error:
            "We couldn't confidently find your salon. Please try a more specific business name and postcode.",
          details: data,
        },
        { status: 404 }
      );
    }

    const salon = data.places[0];

    const rating = salon.rating ?? 0;
    const reviewCount = salon.userRatingCount ?? 0;

    // 先用一个简单版本算竞争对手均值
    // 现在没有抓 competitors，所以先用一个保守估算
    const competitorsReviewAverage = Math.max(reviewCount + 40, 80);

    const reviewGap = Math.max(competitorsReviewAverage - reviewCount, 0);

    let visibilityLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (reviewCount >= 120) {
      visibilityLevel = "HIGH";
    } else if (reviewCount >= 70) {
      visibilityLevel = "MEDIUM";
    }

    let lostClientsPerMonth = 0;
    if (visibilityLevel === "LOW") {
      lostClientsPerMonth = 18;
    } else if (visibilityLevel === "MEDIUM") {
      lostClientsPerMonth = 8;
    } else {
      lostClientsPerMonth = 3;
    }

    const averageTicket = 40;
    const lostRevenuePerMonth = lostClientsPerMonth * averageTicket;

    return NextResponse.json({
      salonName: salon.displayName?.text || salonName,
      rating,
      reviewCount,
      visibilityLevel,
      reviewGap,
      lostClientsPerMonth,
      lostRevenuePerMonth,
      competitorsReviewAverage,
    });
  } catch (error: any) {
    console.error("Server error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong on the server.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}