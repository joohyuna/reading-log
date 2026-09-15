import Link from "next/link";
import { BookForm } from "@/components/BookForm";

export default function NewBookPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← 목록으로
      </Link>
      <h1 className="text-xl font-bold">책 등록</h1>
      <BookForm />
    </div>
  );
}
