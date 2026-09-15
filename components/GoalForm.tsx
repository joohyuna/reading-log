"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { goalInputSchema, type GoalInput } from "@/schemas/goal";

export function GoalForm({
  year,
  initialTargetCount,
}: {
  year: number;
  initialTargetCount: number;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalInput>({
    resolver: zodResolver(goalInputSchema),
    defaultValues: { year, targetCount: initialTargetCount || 1 },
  });

  const onSubmit = async (values: GoalInput) => {
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
      <input type="hidden" {...register("year", { valueAsNumber: true })} />
      <div className="flex flex-col gap-1">
        <label htmlFor="targetCount" className="text-sm font-medium">
          목표 권수
        </label>
        <input
          id="targetCount"
          type="number"
          min={1}
          {...register("targetCount", { valueAsNumber: true })}
          className="w-24 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.targetCount && (
          <p className="text-sm text-red-600">{errors.targetCount.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 disabled:opacity-50"
      >
        저장
      </button>
    </form>
  );
}
