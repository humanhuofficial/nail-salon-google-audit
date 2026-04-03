export type SalonOut = {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
};

export type CompetitorOut = {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
};

export type AnalyzeResponse = {
  salon: SalonOut;
  competitors: CompetitorOut[];
  analysis: {
    averageCompetitorReviews: number;
    reviewGap: number;
    rankingScore: number;
    summary: string;
  };
};
