// 로컬 JSON 저장소(data/reading-log.json) → MongoDB(reading-log DB) 1회성 이관 스크립트.
// 실행: node --env-file=.env scripts/migrate-json-to-mongo.mjs [JSON 경로]
// - _id 기준 upsert라 여러 번 실행해도 중복이 생기지 않는다.
// - 원본 JSON은 수정·삭제하지 않는다 (백업으로 보관).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const file = path.resolve(process.argv[2] ?? "data/reading-log.json");

let data;
try {
  data = JSON.parse(await readFile(file, "utf-8"));
} catch (error) {
  console.error(`JSON 파일을 읽을 수 없습니다: ${file}\n${error.message}`);
  process.exit(1);
}

const books = data.books ?? [];
const goals = data.goals ?? [];

// DB 이름을 잘못 적으면 같은 클러스터의 다른 앱 DB에 쓰게 되므로 미리 확인한다.
const dbName = new URL(process.env.DATABASE_URL ?? "").pathname.slice(1);
if (dbName !== "reading-log") {
  console.error(`DATABASE_URL의 DB 이름이 "reading-log"가 아닙니다 (현재: "${dbName}"). 중단합니다.`);
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  for (const book of books) {
    const doc = {
      title: book.title,
      author: book.author || null,
      status: book.status,
      rating: book.rating ?? null,
      review: book.review ?? null,
      quotes: book.quotes ?? [],
      addedAt: book.addedAt,
      startedAt: book.startedAt ?? null,
      finishedAt: book.finishedAt ?? null,
    };
    await prisma.book.upsert({
      where: { id: book.id },
      create: { id: book.id, ...doc },
      update: doc,
    });
  }

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: { year: goal.year },
      create: { year: goal.year, targetCount: goal.targetCount },
      update: { targetCount: goal.targetCount },
    });
  }

  const [bookCount, goalCount] = await Promise.all([
    prisma.book.count(),
    prisma.goal.count(),
  ]);
  console.log(`이관 완료 (${file})`);
  console.log(`  JSON: books ${books.length}건, goals ${goals.length}건`);
  console.log(`  DB  : books ${bookCount}건, goals ${goalCount}건`);
} finally {
  await prisma.$disconnect();
}
