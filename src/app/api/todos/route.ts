import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, text, completed } = body || {};
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const data: { text?: string; completed?: boolean } = {};
    if (text !== undefined) data.text = text;
    if (completed !== undefined) data.completed = completed;
    const updated = await prisma.todo.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const removed = await prisma.todo.delete({ where: { id } });
    return NextResponse.json(removed);
  } catch {
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
