import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorize } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

type Params = { params: { id: string } }

export async function GET(req: Request, { params }: Params) {
  const session = await authorize()
  if (session instanceof NextResponse) return session

  try {
    const member = await prisma.member.findFirst({
      where: {
        id: params.id,
        familyId: (session as any).user?.familyId || undefined,
      },
      include: {
        parents: { include: { parent: true } },
        children: { include: { child: true } },
        marriagesA: { include: { spouseB: true } },
        marriagesB: { include: { spouseA: true } },
      },
    })
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(member)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await authorize(['admin', 'contributor'])
  if (session instanceof NextResponse) return session

  try {
    const body = await req.json()
    const data: any = {
      fullName: body.fullName,
      gender: body.gender,
      birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
      deathDate: body.deathDate ? new Date(body.deathDate) : undefined,
      birthPlace: body.birthPlace,
      address: body.address,
      occupation: body.occupation,
      phone: body.phone,
      email: body.email,
      photoUrl: body.photoUrl,
      notes: body.notes,
      isAlive: body.isAlive,
    }

    const updated = await prisma.member.update({
      where: { id: params.id },
      data,
    })
    
    // Log activity
    await logActivity({
      userId: (session as any).user?.id,
      userName: (session as any).user?.name || (session as any).user?.email || 'Unknown',
      action: 'updated',
      entityType: 'member',
      entityId: updated.id,
      entityName: updated.fullName,
    })
    
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await authorize(['admin'])
  if (session instanceof NextResponse) return session

  try {
    // Get member info before deleting
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      select: { id: true, fullName: true },
    })
    
    await prisma.member.delete({ where: { id: params.id } })
    
    // Log activity
    if (member) {
      await logActivity({
        userId: (session as any).user?.id,
        userName: (session as any).user?.name || (session as any).user?.email || 'Unknown',
        action: 'deleted',
        entityType: 'member',
        entityId: member.id,
        entityName: member.fullName,
      })
    }
    
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 400 })
  }
}
