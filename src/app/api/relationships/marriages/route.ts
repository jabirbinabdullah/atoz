import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorize } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await authorize(['admin', 'contributor'])
  if (session instanceof NextResponse) return session

  try {
    const { spouseAId, spouseBId, marriageDate, divorceDate, notes } = await req.json()
    if (spouseAId === spouseBId) {
      return NextResponse.json({ error: 'Spouses must be different' }, { status: 400 })
    }
    const marriage = await prisma.marriage.create({
      data: {
        spouseAId,
        spouseBId,
        marriageDate: marriageDate ? new Date(marriageDate) : null,
        divorceDate: divorceDate ? new Date(divorceDate) : null,
        notes: notes ?? null,
      },
    })
    return NextResponse.json(marriage, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create marriage' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const session = await authorize(['admin'])
  if (session instanceof NextResponse) return session

  try {
    const { spouseAId, spouseBId } = await req.json()
    await prisma.marriage.delete({
      where: { spouseAId_spouseBId: { spouseAId, spouseBId } },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete marriage' }, { status: 400 })
  }
}
