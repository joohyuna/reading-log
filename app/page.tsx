import Link from "next/link";
import { connection } from "next/server";
import { getBooks } from "@/lib/data/books";
import { BookList } from "@/components/BookList";

export default async function Home() {
  // DB 데이터를 요청 시점에 읽도록 빌드 시 프리렌더를 막는다.
  await connection();
  const books = await getBooks();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reading Log</h1>
        <div className="flex gap-2">
          <Link
            href="/stats"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
          >
            통계
          </Link>
          <Link
            href="/books/new"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            책 등록
          </Link>
        </div>
      </div>
      <BookList books={books} />
    </div>
  );
}
