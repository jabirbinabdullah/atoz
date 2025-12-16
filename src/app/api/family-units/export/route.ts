import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * GET: Generate tree text export for a family unit
 */
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
    const familyUnitId = searchParams.get('familyUnitId');
    const format = searchParams.get('format') || 'tree'; // tree or hierarchy

    if (!familyUnitId) {
      return NextResponse.json(
        { error: 'familyUnitId is required' },
        { status: 400 }
      );
    }

    // Get root family unit
    const rootUnit = await prisma.familyUnit.findUnique({
      where: { id: familyUnitId },
      include: {
        father: { select: { id: true, fullName: true, isAlive: true } },
        mother: { select: { id: true, fullName: true, isAlive: true } },
        children: { include: { member: { select: { id: true, fullName: true, isAlive: true } } } },
        childUnits: {
          select: {
            id: true,
            father: { select: { id: true, fullName: true } },
            mother: { select: { id: true, fullName: true } }
          }
        }
      }
    });

    if (!rootUnit) {
      return NextResponse.json(
        { error: 'Family unit not found' },
        { status: 404 }
      );
    }

    // Get all family units for tree building
    const familyId = rootUnit.familyId;
    const allUnits = await prisma.familyUnit.findMany({
      where: { familyId },
      include: {
        father: { select: { id: true, fullName: true, isAlive: true } },
        mother: { select: { id: true, fullName: true, isAlive: true } },
        children: { include: { member: { select: { id: true, fullName: true, isAlive: true } } } },
        childUnits: {
          select: {
            id: true,
            father: { select: { id: true, fullName: true } },
            mother: { select: { id: true, fullName: true } }
          }
        }
      }
    });

    // Build tree structure
    const tree = buildTree(rootUnit, allUnits);
    const treeText = generateTreeText(tree);

    // Get statistics
    const stats = {
      totalUnits: allUnits.length,
      totalMembers: countMembers(allUnits),
      generations: calculateGenerations(tree),
      deceasedCount: countDeceased(tree)
    };

    return NextResponse.json({
      treeText,
      stats,
      format
    });
  } catch (error) {
    console.error('Error generating tree export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

interface TreeUnit {
  id: string;
  fatherName?: string;
  motherName?: string;
  childrenNames: string[];
  childUnits: TreeUnit[];
  isDeceased: boolean;
}

function buildTree(
  unit: any,
  allUnits: any[],
  visited: Set<string> = new Set()
): TreeUnit {
  if (visited.has(unit.id)) {
    return {
      id: unit.id,
      fatherName: unit.father?.fullName,
      motherName: unit.mother?.fullName,
      childrenNames: unit.children?.map((c: any) => c.member.fullName) || [],
      childUnits: [],
      isDeceased: !unit.father?.isAlive || !unit.mother?.isAlive
    };
  }

  visited.add(unit.id);

  const childUnits = unit.childUnits?.map((cu: any) => {
    const childUnit = allUnits.find(u => u.id === cu.id);
    return childUnit ? buildTree(childUnit, allUnits, visited) : null;
  }).filter(Boolean) || [];

  return {
    id: unit.id,
    fatherName: unit.father?.fullName,
    motherName: unit.mother?.fullName,
    childrenNames: unit.children?.map((c: any) => c.member.fullName) || [],
    childUnits,
    isDeceased: !unit.father?.isAlive || !unit.mother?.isAlive
  };
}

function generateTreeText(unit: TreeUnit, prefix: string = '', isLast: boolean = true): string {
  const lines: string[] = [];

  const deceased = unit.isDeceased ? ' (Alm)' : '';
  const connector = prefix + (isLast ? '└── ' : '├── ');
  const nodeName =
    unit.fatherName && unit.motherName
      ? `${unit.fatherName} + ${unit.motherName}`
      : unit.fatherName || unit.motherName || 'Unknown Couple';

  lines.push(connector + nodeName + deceased);

  // Add children
  const allChildren = [
    ...(unit.childrenNames.map(name => ({ name, type: 'child' })) || []),
    ...unit.childUnits
  ];

  if (allChildren.length > 0) {
    lines.push(prefix + (isLast ? '    ' : '│   ') + '│');

    // Add regular children
    unit.childrenNames?.forEach((name, idx) => {
      const isLastChild = idx === unit.childrenNames.length - 1 && unit.childUnits.length === 0;
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      const childConnector = newPrefix + (isLastChild ? '└── ' : '├── ');
      lines.push(childConnector + '• ' + name);
    });

    // Add child units
    unit.childUnits.forEach((childUnit, idx) => {
      const isLastChild = idx === unit.childUnits.length - 1;
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      const childText = generateTreeText(childUnit, newPrefix, isLastChild);
      lines.push(childText);
    });
  }

  return lines.join('\n');
}

function countMembers(units: any[]): number {
  const memberSet = new Set<string>();

  units.forEach(unit => {
    if (unit.father?.id) memberSet.add(unit.father.id);
    if (unit.mother?.id) memberSet.add(unit.mother.id);
    unit.children?.forEach((c: any) => memberSet.add(c.member.id));
  });

  return memberSet.size;
}

function calculateGenerations(unit: TreeUnit): number {
  if (unit.childUnits.length === 0) return 1;
  return 1 + Math.max(...unit.childUnits.map(calculateGenerations));
}

function countDeceased(unit: TreeUnit): number {
  let count = unit.isDeceased ? 1 : 0;
  unit.childUnits.forEach(child => {
    count += countDeceased(child);
  });
  return count;
}
