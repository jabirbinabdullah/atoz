import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorize } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await authorize(['admin', 'contributor'])
  if (session instanceof NextResponse) return session

  try {
    const { parentId, childId, parentRole } = await req.json()
    if (parentId === childId) {
      return NextResponse.json({ error: 'Parent and child must differ' }, { status: 400 })
    }
    const rel = await prisma.parentChild.create({
      data: { parentId, childId, parentRole },
    })
    return NextResponse.json(rel, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create relationship' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const session = await authorize(['admin'])
  if (session instanceof NextResponse) return session

  try {
    const { parentId, childId } = await req.json()
    await prisma.parentChild.delete({
      where: { parentId_childId: { parentId, childId } },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete relationship' }, { status: 400 })
  }
}
