import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorize } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

export async function GET(req: Request) {
  const session = await authorize()
  if (session instanceof NextResponse) return session

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || undefined
  const gender = searchParams.get('gender') || undefined
  const isAliveParam = searchParams.get('isAlive')
  const includeRelations = searchParams.get('include') === 'relations'

  const where: any = {}
  if ((session as any).user?.familyId) where.familyId = (session as any).user.familyId
  if (q) where.fullName = { contains: q, mode: 'insensitive' }
  if (gender) where.gender = gender
  if (isAliveParam !== null && isAliveParam !== '') where.isAlive = isAliveParam === 'true'

  try {
    const members = await prisma.member.findMany({
      where,
      orderBy: { fullName: 'asc' },
      take: 200,
      include: includeRelations
        ? {
            parents: { include: { parent: true } },
            children: { include: { child: true } },
          }
        : undefined,
    })
    return NextResponse.json(members)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await authorize(['admin', 'contributor'])
  if (session instanceof NextResponse) return session

  try {
    const body = await req.json()
    const familyId = (session as any).user?.familyId || body.familyId
    if (!familyId) {
      return NextResponse.json({ error: 'familyId is required' }, { status: 400 })
    }

    const member = await prisma.member.create({
      data: {
        fullName: body.fullName,
        gender: body.gender ?? null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        deathDate: body.deathDate ? new Date(body.deathDate) : null,
        birthPlace: body.birthPlace ?? null,
        address: body.address ?? null,
        occupation: body.occupation ?? null,
        phone: body.phone ?? null,
        email: body.email ?? null,
        photoUrl: body.photoUrl ?? null,
        notes: body.notes ?? null,
        isAlive: body.isAlive ?? true,
        familyId,
        createdByUserId: (session as any).user?.id ?? null,
      },
    })
    
    // Log activity
    await logActivity({
      userId: (session as any).user?.id,
      userName: (session as any).user?.name || (session as any).user?.email || 'Unknown',
      action: 'created',
      entityType: 'member',
      entityId: member.id,
      entityName: member.fullName,
    })
    
    return NextResponse.json(member, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create member' }, { status: 400 })
  }
}
