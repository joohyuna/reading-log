import { z } from "zod";

export const bookStatuses = [
  "want-to-read",
  "reading",
  "completed",
  "abandoned",
] as const;

export const bookStatusSchema = z.enum(bookStatuses);
export type BookStatus = z.infer<typeof bookStatusSchema>;

export const bookStatusLabels: Record<BookStatus, string> = {
  "want-to-read": "읽고 싶어요",
  reading: "읽는중",
  completed: "완독",
  abandoned: "중단",
};

export const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string().optional(),
  status: bookStatusSchema,
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().optional(),
  quotes: z.array(z.string()).default([]),
  addedAt: z.string(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
});
export type Book = z.infer<typeof bookSchema>;

export const bookInputSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요"),
  author: z.string().trim().optional(),
  status: bookStatusSchema,
});
export type BookInput = z.infer<typeof bookInputSchema>;

export const bookUpdateSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요").optional(),
  author: z.string().trim().optional(),
  status: bookStatusSchema.optional(),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().trim().max(500, "500자 이내로 입력해주세요").optional(),
  quotes: z.array(z.string().trim().min(1)).optional(),
});
export type BookUpdate = z.infer<typeof bookUpdateSchema>;
