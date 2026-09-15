"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  bookInputSchema,
  bookStatusLabels,
  bookStatuses,
  type BookInput,
} from "@/schemas/book";

export function BookForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookInput>({
    resolver: zodResolver(bookInputSchema),
    defaultValues: { title: "", author: "", status: "want-to-read" },
  });

  const onSubmit = async (values: BookInput) => {
    setSubmitError(null);

    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      setSubmitError("책을 등록하지 못했어요. 다시 시도해주세요.");
      return;
    }

    router.push("/");
    router.refresh();
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

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {isSubmitting ? "등록 중..." : "등록"}
      </button>
    </form>
  );
}
