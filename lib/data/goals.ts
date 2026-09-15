import { readData, writeData } from "./store";
import type { ReadingGoal } from "@/schemas/goal";

export async function getGoal(year: number): Promise<ReadingGoal | undefined> {
  const data = await readData();
  return data.goals.find((goal) => goal.year === year);
}

export async function setGoal(
  year: number,
  targetCount: number
): Promise<ReadingGoal> {
  const data = await readData();
  const index = data.goals.findIndex((goal) => goal.year === year);
  const goal: ReadingGoal = { year, targetCount };

  if (index === -1) {
    data.goals.push(goal);
  } else {
    data.goals[index] = goal;
  }

  await writeData(data);
  return goal;
}
