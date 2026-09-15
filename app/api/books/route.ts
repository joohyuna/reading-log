import { NextRequest, NextResponse } from "next/server";
import { bookInputSchema } from "@/schemas/book";
import { addBook, getBooks } from "@/lib/data/books";

export async function GET() {
  const books = await getBooks();
  return NextResponse.json(books);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bookInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const book = await addBook(parsed.data);
  return NextResponse.json(book, { status: 201 });
}
