"use client";

import { useMemo, useState } from "react";
import {
  bookStatusLabels,
  bookStatuses,
  type Book,
  type BookStatus,
} from "@/schemas/book";
import { BookCard } from "./BookCard";

const FILTERS: Array<{ value: BookStatus | "all"; label: string }> = [
  { value: "all", label: "전체" },
  ...bookStatuses.map((status) => ({
    value: status,
    label: bookStatusLabels[status],
  })),
];

export function BookList({ books }: { books: Book[] }) {
  const [filter, setFilter] = useState<BookStatus | "all">("all");

  const filtered = useMemo(
    () =>
      filter === "all" ? books : books.filter((book) => book.status === filter),
    [books, filter]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              filter === f.value
                ? "bg-foreground text-background"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">아직 등록된 책이 없어요.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
