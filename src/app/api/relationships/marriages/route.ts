import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorize } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

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
      include: {
        spouseA: { select: { fullName: true } },
        spouseB: { select: { fullName: true } },
      },
    })
    
    // Log activity
    await logActivity({
      userId: (session as any).user?.id,
      userName: (session as any).user?.name || (session as any).user?.email || 'Unknown',
      action: 'created',
      entityType: 'marriage',
      entityName: `${marriage.spouseA.fullName} ❤ ${marriage.spouseB.fullName}`,
      details: { marriageDate, divorceDate, notes },
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
    
    // Get marriage info before deleting
    const marriage = await prisma.marriage.findUnique({
      where: { spouseAId_spouseBId: { spouseAId, spouseBId } },
      include: {
        spouseA: { select: { fullName: true } },
        spouseB: { select: { fullName: true } },
      },
    })
    
    await prisma.marriage.delete({
      where: { spouseAId_spouseBId: { spouseAId, spouseBId } },
    })
    
    // Log activity
    if (marriage) {
      await logActivity({
        userId: (session as any).user?.id,
        userName: (session as any).user?.name || (session as any).user?.email || 'Unknown',
        action: 'deleted',
        entityType: 'marriage',
        entityName: `${marriage.spouseA.fullName} ❤ ${marriage.spouseB.fullName}`,
      })
    }
    
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete marriage' }, { status: 400 })
  }
}
