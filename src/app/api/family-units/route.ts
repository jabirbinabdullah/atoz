import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

// GET: List all family units in a family
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json(
        { error: 'familyId is required' },
        { status: 400 }
      );
    }

    const familyUnits = await prisma.familyUnit.findMany({
      where: { familyId },
      include: {
        father: {
          select: { id: true, fullName: true, gender: true, birthDate: true }
        },
        mother: {
          select: { id: true, fullName: true, gender: true, birthDate: true }
        },
        children: {
          include: {
            member: {
              select: { id: true, fullName: true, gender: true, birthDate: true }
            }
          }
        },
        parentUnit: {
          select: { id: true }
        },
        _count: {
          select: { childUnits: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(familyUnits);
  } catch (error) {
    console.error('Error fetching family units:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new family unit
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { familyId, fatherId, motherId, childrenIds = [], marriageId, parentUnitId } = body;

    if (!familyId) {
      return NextResponse.json(
        { error: 'familyId is required' },
        { status: 400 }
      );
    }

    // Validate family exists
    const family = await prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // Create family unit
    const familyUnit = await prisma.familyUnit.create({
      data: {
        familyId,
        fatherId: fatherId || null,
        motherId: motherId || null,
        marriageId: marriageId || null,
        parentUnitId: parentUnitId || null,
        children: {
          createMany: {
            data: childrenIds.map((memberId: string) => ({ memberId })),
            skipDuplicates: true
          }
        }
      },
      include: {
        father: { select: { id: true, fullName: true } },
        mother: { select: { id: true, fullName: true } },
        children: { include: { member: { select: { id: true, fullName: true } } } }
      }
    });

    // Log activity
    const unitName = `${familyUnit.father?.fullName || ''} & ${familyUnit.mother?.fullName || 'Partner'}`.trim();
    await logActivity(
      session.user.id || '',
      session.user.name || session.user.email,
      'created',
      'familyunit',
      familyUnit.id,
      unitName,
      {
        fatherId,
        motherId,
        childrenCount: childrenIds.length
      }
    );

    return NextResponse.json(familyUnit, { status: 201 });
  } catch (error) {
    console.error('Error creating family unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
