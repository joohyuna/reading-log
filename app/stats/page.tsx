import Link from "next/link";
import { getBooks } from "@/lib/data/books";
import { getGoal } from "@/lib/data/goals";
import { MonthlyChart } from "@/components/MonthlyChart";
import { GoalForm } from "@/components/GoalForm";

export default async function StatsPage() {
  const year = new Date().getFullYear();
  const [books, goal] = await Promise.all([getBooks(), getGoal(year)]);

  const completedThisYear = books.filter(
    (book) => book.finishedAt && new Date(book.finishedAt).getFullYear() === year
  );

  const monthlyCounts = Array(12).fill(0);
  for (const book of completedThisYear) {
    const month = new Date(book.finishedAt!).getMonth();
    monthlyCounts[month] += 1;
  }

  const targetCount = goal?.targetCount ?? 0;
  const progress =
    targetCount > 0
      ? Math.min(100, Math.round((completedThisYear.length / targetCount) * 100))
      : 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">통계</h1>
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← 목록으로
        </Link>
      </div>

      <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">{year}년 목표</h2>
        {targetCount > 0 ? (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {completedThisYear.length} / {targetCount}권 완독 ({progress}%)
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full bg-foreground"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-500">아직 목표가 설정되지 않았어요.</p>
        )}
        <GoalForm year={year} initialTargetCount={targetCount} />
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">월별 독서량</h2>
        <MonthlyChart counts={monthlyCounts} />
      </section>
    </div>
  );
}
