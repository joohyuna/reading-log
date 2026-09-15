"use client";

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export function RatingInput({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {STAR_VALUES.map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star}점`}
          onClick={() => onChange(value === star ? undefined : star)}
          className={`text-2xl leading-none ${
            value && star <= value
              ? "text-amber-400"
              : "text-zinc-300 dark:text-zinc-600"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
