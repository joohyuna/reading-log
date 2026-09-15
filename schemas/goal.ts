import { z } from "zod";

export const goalSchema = z.object({
  year: z.number().int(),
  targetCount: z.number().int().min(1, "목표 권수는 1권 이상이어야 해요"),
});
export type ReadingGoal = z.infer<typeof goalSchema>;

export const goalInputSchema = goalSchema;
export type GoalInput = z.infer<typeof goalInputSchema>;
