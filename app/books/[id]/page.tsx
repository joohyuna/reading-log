import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookById } from "@/lib/data/books";
import { BookDetailEditor } from "@/components/BookDetailEditor";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← 목록으로
      </Link>
      <BookDetailEditor book={book} />
    </div>
  );
}
