import Link from "next/link";
import type { Book } from "@/schemas/book";
import { StatusBadge } from "./StatusBadge";

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{book.title}</h3>
        <StatusBadge status={book.status} />
      </div>
      {book.author && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{book.author}</p>
      )}
      {book.rating && (
        <p className="text-amber-400" aria-label={`별점 ${book.rating}점`}>
          {"★".repeat(book.rating)}
          <span className="text-zinc-300 dark:text-zinc-600">
            {"★".repeat(5 - book.rating)}
          </span>
        </p>
      )}
    </Link>
  );
}
