import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(todo);
  } catch {
    return NextResponse.json({ error: "Failed to fetch todo" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const body = await req.json().catch(() => ({}));
    const { text, completed } = body || {};
    // verify exists first
    const exists = await prisma.todo.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data: { text?: string; completed?: boolean } = {};
    if (text !== undefined) data.text = text;
    if (completed !== undefined) data.completed = completed;
    const updated = await prisma.todo.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const exists = await prisma.todo.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const removed = await prisma.todo.delete({ where: { id } });
    return NextResponse.json(removed);
  } catch {
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
