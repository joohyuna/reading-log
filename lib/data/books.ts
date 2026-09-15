import { randomUUID } from "crypto";
import { readData, writeData } from "./store";
import type { Book, BookInput, BookUpdate } from "@/schemas/book";

export async function getBooks(): Promise<Book[]> {
  const data = await readData();
  return data.books;
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const data = await readData();
  return data.books.find((book) => book.id === id);
}

export async function addBook(input: BookInput): Promise<Book> {
  const data = await readData();
  const now = new Date().toISOString();

  const book: Book = {
    id: randomUUID(),
    title: input.title,
    author: input.author || undefined,
    status: input.status,
    quotes: [],
    addedAt: now,
    ...(input.status === "reading" ? { startedAt: now } : {}),
    ...(input.status === "completed" ? { startedAt: now, finishedAt: now } : {}),
  };

  data.books.push(book);
  await writeData(data);
  return book;
}

export async function updateBook(
  id: string,
  patch: BookUpdate
): Promise<Book | undefined> {
  const data = await readData();
  const index = data.books.findIndex((book) => book.id === id);
  if (index === -1) return undefined;

  const existing = data.books[index];
  const now = new Date().toISOString();
  const updated: Book = { ...existing, ...patch };

  if (updated.author === "") {
    updated.author = undefined;
  }

  if (patch.status && patch.status !== existing.status) {
    if (patch.status === "reading" && !existing.startedAt) {
      updated.startedAt = now;
    }
    if (patch.status === "completed" && !existing.finishedAt) {
      updated.finishedAt = now;
    }
  }

  data.books[index] = updated;
  await writeData(data);
  return updated;
}

export async function deleteBook(id: string): Promise<boolean> {
  const data = await readData();
  const before = data.books.length;
  data.books = data.books.filter((book) => book.id !== id);
  await writeData(data);
  return data.books.length < before;
}
