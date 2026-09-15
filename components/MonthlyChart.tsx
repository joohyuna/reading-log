const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export function MonthlyChart({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);

  return (
    <div className="flex h-40 items-end gap-2">
      {counts.map((count, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] text-zinc-500">{count > 0 ? count : ""}</span>
          <div
            className="w-full rounded-t bg-foreground/80"
            style={{
              height: `${(count / max) * 100}%`,
              minHeight: count > 0 ? "4px" : "0",
            }}
            aria-label={`${MONTH_LABELS[i]} ${count}권`}
          />
          <span className="text-[10px] text-zinc-500">{MONTH_LABELS[i]}</span>
        </div>
      ))}
    </div>
  );
}
