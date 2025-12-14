import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

// GET: Get a specific family unit
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const familyUnit = await prisma.familyUnit.findUnique({
      where: { id },
      include: {
        father: {
          select: { id: true, fullName: true, gender: true, birthDate: true, email: true, phone: true }
        },
        mother: {
          select: { id: true, fullName: true, gender: true, birthDate: true, email: true, phone: true }
        },
        marriage: {
          select: { id: true, marriageDate: true, divorceDate: true, notes: true }
        },
        children: {
          include: {
            member: {
              select: { id: true, fullName: true, gender: true, birthDate: true }
            }
          }
        },
        parentUnit: {
          select: { 
            id: true,
            father: { select: { fullName: true } },
            mother: { select: { fullName: true } }
          }
        },
        childUnits: {
          select: {
            id: true,
            father: { select: { fullName: true } },
            mother: { select: { fullName: true } }
          }
        }
      }
    });

    if (!familyUnit) {
      return NextResponse.json(
        { error: 'Family unit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(familyUnit);
  } catch (error) {
    console.error('Error fetching family unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update a family unit
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { fatherId, motherId, childrenIds = [], marriageId, parentUnitId } = body;

    const familyUnit = await prisma.familyUnit.findUnique({ where: { id } });
    if (!familyUnit) {
      return NextResponse.json(
        { error: 'Family unit not found' },
        { status: 404 }
      );
    }

    // Update family unit
    const updated = await prisma.familyUnit.update({
      where: { id },
      data: {
        fatherId: fatherId || null,
        motherId: motherId || null,
        marriageId: marriageId || null,
        parentUnitId: parentUnitId || null
      },
      include: {
        father: { select: { id: true, fullName: true } },
        mother: { select: { id: true, fullName: true } },
        children: { include: { member: { select: { id: true, fullName: true } } } }
      }
    });

    // Update children if provided
    if (childrenIds.length > 0) {
      // Remove old children
      await prisma.familyUnitMember.deleteMany({
        where: { familyUnitId: id }
      });

      // Add new children
      await prisma.familyUnitMember.createMany({
        data: childrenIds.map((memberId: string) => ({
          familyUnitId: id,
          memberId
        }))
      });
    }

    // Log activity
    const unitName = `${updated.father?.fullName || ''} & ${updated.mother?.fullName || 'Partner'}`.trim();
    await logActivity(
      session.user.id || '',
      session.user.name || session.user.email,
      'updated',
      'familyunit',
      id,
      unitName,
      { fatherId, motherId, childrenCount: childrenIds.length }
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating family unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a family unit
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const familyUnit = await prisma.familyUnit.findUnique({
      where: { id },
      include: {
        father: { select: { fullName: true } },
        mother: { select: { fullName: true } }
      }
    });

    if (!familyUnit) {
      return NextResponse.json(
        { error: 'Family unit not found' },
        { status: 404 }
      );
    }

    // Delete the family unit
    await prisma.familyUnit.delete({ where: { id } });

    // Log activity
    const unitName = `${familyUnit.father?.fullName || ''} & ${familyUnit.mother?.fullName || 'Partner'}`.trim();
    await logActivity(
      session.user.id || '',
      session.user.name || session.user.email,
      'deleted',
      'familyunit',
      id,
      unitName
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting family unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
