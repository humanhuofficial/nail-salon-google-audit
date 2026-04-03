import type { CompetitorOut, SalonOut } from "@/lib/types";

/**
 * 计算简单排名分（0-100）。
 * 规则：评分占 60%，评论量占 40%（评论量封顶 300）。
 */
export function computeRankingScore(rating: number, reviewCount: number): number {
  const safeRating = Math.min(Math.max(rating, 0), 5);
  const safeReviews = Math.min(Math.max(reviewCount, 0), 300);
  const score = (safeRating / 5) * 60 + (safeReviews / 300) * 40;
  return Math.round(Math.min(100, Math.max(0, score)));
}

/** 计算竞品平均评论数（四舍五入）。 */
export function computeAverageCompetitorReviews(items: CompetitorOut[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + item.reviewCount, 0);
  return Math.round(total / items.length);
}

/**
 * 根据门店与竞品生成分析结果。
 * 这个函数在服务端运行，避免前端出现“假数据分析”。
 */
export function buildAnalysis(salon: SalonOut, competitors: CompetitorOut[]) {
  const averageCompetitorReviews = computeAverageCompetitorReviews(competitors);
  const reviewGap = averageCompetitorReviews - salon.reviewCount;
  const rankingScore = computeRankingScore(salon.rating, salon.reviewCount);
  const summary = `You have ${salon.reviewCount} reviews. Nearby competitors average ${averageCompetitorReviews}.`;

  return {
    averageCompetitorReviews,
    reviewGap,
    rankingScore,
    summary,
  };
}
