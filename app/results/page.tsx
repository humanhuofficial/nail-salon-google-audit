import { ResultsClient } from "@/components/ResultsClient";

type Props = {
  searchParams: {
    salon?: string;
    area?: string;
  };
};

export default function ResultsPage({ searchParams }: Props) {
  // 这里仅负责读取 URL 参数；真实数据请求在客户端调用 /api/analyze。
  const salonName = searchParams.salon?.trim() || "";
  const area = searchParams.area?.trim() || "";

  if (!salonName || !area) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 sm:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
          <h1 className="text-xl font-semibold text-rose-900">Missing input</h1>
          <p className="mt-3 text-sm text-rose-800">
            Please go back and enter both salon name and postcode / area.
          </p>
        </div>
      </main>
    );
  }

  return <ResultsClient salonName={salonName} area={area} />;
}
