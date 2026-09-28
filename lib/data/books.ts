import { randomUUID } from "crypto";
import type { Book as BookRow } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Book, BookInput, BookStatus, BookUpdate } from "@/schemas/book";

// Prisma는 비어 있는 선택 필드를 null로 돌려주지만, Book 타입(zod optional)은 undefined를 기대한다.
function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author ?? undefined,
    status: row.status as BookStatus,
    rating: row.rating ?? undefined,
    review: row.review ?? undefined,
    quotes: row.quotes,
    addedAt: row.addedAt,
    startedAt: row.startedAt ?? undefined,
    finishedAt: row.finishedAt ?? undefined,
  };
}

export async function getBooks(): Promise<Book[]> {
  // JSON 저장 시절과 같은 순서(추가 순)를 유지한다.
  const rows = await prisma.book.findMany({ orderBy: { addedAt: "asc" } });
  return rows.map(toBook);
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const row = await prisma.book.findUnique({ where: { id } });
  return row ? toBook(row) : undefined;
}

export async function addBook(input: BookInput): Promise<Book> {
  const now = new Date().toISOString();

  const row = await prisma.book.create({
    data: {
      id: randomUUID(),
      title: input.title,
      author: input.author || null,
      status: input.status,
      quotes: [],
      addedAt: now,
      ...(input.status === "reading" ? { startedAt: now } : {}),
      ...(input.status === "completed" ? { startedAt: now, finishedAt: now } : {}),
    },
  });

  return toBook(row);
}

export async function updateBook(
  id: string,
  patch: BookUpdate
): Promise<Book | undefined> {
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) return undefined;

  const now = new Date().toISOString();
  // Prisma update에서 undefined는 "변경 안 함"이므로, 저자를 비울 때는 null을 넘긴다.
  const data: Parameters<typeof prisma.book.update>[0]["data"] = {
    ...patch,
    ...(patch.author === "" ? { author: null } : {}),
  };

  if (patch.status && patch.status !== existing.status) {
    if (patch.status === "reading" && !existing.startedAt) {
      data.startedAt = now;
    }
    if (patch.status === "completed" && !existing.finishedAt) {
      data.finishedAt = now;
    }
  }

  const row = await prisma.book.update({ where: { id }, data });
  return toBook(row);
}

export async function deleteBook(id: string): Promise<boolean> {
  // delete()는 없는 id에 예외를 던지므로 deleteMany로 존재 여부를 count로 판단한다.
  const { count } = await prisma.book.deleteMany({ where: { id } });
  return count > 0;
}
