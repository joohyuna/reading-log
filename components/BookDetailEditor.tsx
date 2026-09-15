"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  bookStatusLabels,
  bookStatusSchema,
  bookStatuses,
  bookUpdateSchema,
  type Book,
  type BookUpdate,
} from "@/schemas/book";
import { RatingInput } from "./RatingInput";

const editFormSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요"),
  author: z.string().trim().optional(),
  status: bookStatusSchema,
  review: z.string().trim().max(500, "500자 이내로 입력해주세요").optional(),
});
type EditFormValues = z.infer<typeof editFormSchema>;

export function BookDetailEditor({ book }: { book: Book }) {
  const router = useRouter();
  const [quotes, setQuotes] = useState<string[]>(book.quotes);
  const [quoteInput, setQuoteInput] = useState("");
  const [rating, setRating] = useState<number | undefined>(book.rating);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: book.title,
      author: book.author,
      status: book.status,
      review: book.review ?? "",
    },
  });

  const addQuote = () => {
    const trimmed = quoteInput.trim();
    if (!trimmed) return;
    setQuotes((prev) => [...prev, trimmed]);
    setQuoteInput("");
  };

  const removeQuote = (index: number) => {
    setQuotes((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: EditFormValues) => {
    setError(null);
    const patch: BookUpdate = { ...values, rating, quotes };
    const parsed = bookUpdateSchema.safeParse(patch);

    if (!parsed.success) {
      setError("입력값을 확인해주세요.");
      return;
    }

    const res = await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      setError("저장하지 못했어요. 다시 시도해주세요.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const onDelete = async () => {
    if (!confirm("이 책을 삭제할까요?")) return;
    const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          제목
        </label>
        <input
          id="title"
          {...register("title")}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="author" className="text-sm font-medium">
          저자 <span className="font-normal text-zinc-400">(선택)</span>
        </label>
        <input
          id="author"
          {...register("author")}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.author && (
          <p className="text-sm text-red-600">{errors.author.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-sm font-medium">
          상태
        </label>
        <select
          id="status"
          {...register("status")}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {bookStatuses.map((status) => (
            <option key={status} value={status}>
              {bookStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">별점</span>
        <RatingInput value={rating} onChange={setRating} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="review" className="text-sm font-medium">
          한줄평
        </label>
        <textarea
          id="review"
          rows={2}
          {...register("review")}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">인상 깊은 문장</span>
        <div className="flex gap-2">
          <input
            value={quoteInput}
            onChange={(e) => setQuoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addQuote();
              }
            }}
            placeholder="문장을 입력하고 Enter"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={addQuote}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            추가
          </button>
        </div>
        {quotes.length > 0 && (
          <ul className="flex flex-col gap-1">
            {quotes.map((quote, index) => (
              <li
                key={index}
                className="flex items-start justify-between gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800"
              >
                <span>{quote}</span>
                <button
                  type="button"
                  onClick={() => removeQuote(index)}
                  className="text-zinc-500 hover:text-red-600"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-red-600 hover:underline"
        >
          책 삭제
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
