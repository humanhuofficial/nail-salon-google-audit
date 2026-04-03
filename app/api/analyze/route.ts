import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Incoming body:", body);

    const name = body?.name?.trim?.() || "";
    const postcode = body?.postcode?.trim?.() || "";

    if (!name || !postcode) {
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

    const query = `${name} ${postcode} UK nail salon`;
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

    let data: any = null;
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

    if (!data.places || data.places.length === 0) {
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

    return NextResponse.json({
      salon: {
        name: salon.displayName?.text || "Unknown salon",
        address: salon.formattedAddress || "No address found",
        rating: salon.rating ?? 0,
        reviewCount: salon.userRatingCount ?? 0,
        lat: salon.location?.latitude ?? 0,
        lng: salon.location?.longitude ?? 0,
      },
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