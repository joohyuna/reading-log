import { NextRequest, NextResponse } from "next/server";
import { goalInputSchema } from "@/schemas/goal";
import { getGoal, setGoal } from "@/lib/data/goals";

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();
  const goal = await getGoal(year);
  return NextResponse.json(goal ?? { year, targetCount: 0 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const parsed = goalInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const goal = await setGoal(parsed.data.year, parsed.data.targetCount);
  return NextResponse.json(goal);
}
