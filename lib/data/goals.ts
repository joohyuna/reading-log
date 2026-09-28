import { prisma } from "@/lib/prisma";
import type { ReadingGoal } from "@/schemas/goal";

export async function getGoal(year: number): Promise<ReadingGoal | undefined> {
  const goal = await prisma.goal.findUnique({ where: { year } });
  return goal ?? undefined;
}

export async function setGoal(
  year: number,
  targetCount: number
): Promise<ReadingGoal> {
  return prisma.goal.upsert({
    where: { year },
    create: { year, targetCount },
    update: { targetCount },
  });
}
