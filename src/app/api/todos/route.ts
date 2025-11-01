import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Collection handlers: GET (list), POST (create)
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(todos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = (body && body.text) || "Untitled";
    const todo = await prisma.todo.create({ data: { text } });
    return NextResponse.json(todo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}
