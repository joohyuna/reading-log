import { promises as fs } from "fs";
import path from "path";
import type { Book } from "@/schemas/book";
import type { ReadingGoal } from "@/schemas/goal";

type DataShape = {
  books: Book[];
  goals: ReadingGoal[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "reading-log.json");

const EMPTY_DATA: DataShape = { books: [], goals: [] };

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(EMPTY_DATA, null, 2), "utf-8");
  }
}

export async function readData(): Promise<DataShape> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as DataShape;
}

export async function writeData(data: DataShape): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}
