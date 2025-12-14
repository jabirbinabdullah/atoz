import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorize } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

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
      include: {
        parent: { select: { fullName: true } },
        child: { select: { fullName: true } },
      },
    })
    
    // Log activity
    await logActivity({
      userId: (session as any).user?.id,
      userName: (session as any).user?.name || (session as any).user?.email || 'Unknown',
      action: 'created',
      entityType: 'relationship',
      entityName: `${rel.parent.fullName} → ${rel.child.fullName}`,
      details: { type: 'parent-child', parentRole },
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
    
    // Get relationship info before deleting
    const rel = await prisma.parentChild.findUnique({
      where: { parentId_childId: { parentId, childId } },
      include: {
        parent: { select: { fullName: true } },
        child: { select: { fullName: true } },
      },
    })
    
    await prisma.parentChild.delete({
      where: { parentId_childId: { parentId, childId } },
    })
    
    // Log activity
    if (rel) {
      await logActivity({
        userId: (session as any).user?.id,
        userName: (session as any).user?.name || (session as any).user?.email || 'Unknown',
        action: 'deleted',
        entityType: 'relationship',
        entityName: `${rel.parent.fullName} → ${rel.child.fullName}`,
        details: { type: 'parent-child' },
      })
    }
    
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete relationship' }, { status: 400 })
  }
}
