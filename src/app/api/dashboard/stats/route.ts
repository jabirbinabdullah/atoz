import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get total members count
    const totalMembers = await prisma.member.count()

    // Get living members count
    const livingMembers = await prisma.member.count({
      where: { isAlive: true },
    })

    // Get members added this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const membersThisMonth = await prisma.member.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    })

    // Calculate generations (depth of family tree)
    // Find the oldest ancestor (no parents) and traverse down
    const oldestAncestors = await prisma.member.findMany({
      where: {
        parents: {
          none: {},
        },
      },
      select: {
        id: true,
      },
    })

    let maxGenerations = 0
    
    // For each root ancestor, calculate max depth
    for (const ancestor of oldestAncestors) {
      const depth = await calculateDepth(ancestor.id)
      if (depth > maxGenerations) {
        maxGenerations = depth
      }
    }

    // If no ancestors found, check if there are any members
    if (oldestAncestors.length === 0 && totalMembers > 0) {
      // All members have parents, so start from any member and count backwards then forwards
      maxGenerations = await estimateGenerationsFromMiddle()
    }

    return NextResponse.json({
      totalMembers,
      livingMembers,
      generations: maxGenerations,
      membersThisMonth,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}

// Recursively calculate depth from a given ancestor
async function calculateDepth(memberId: string, visited = new Set<string>()): Promise<number> {
  if (visited.has(memberId)) {
    return 0 // Prevent infinite loops
  }
  visited.add(memberId)

  const children = await prisma.parentChild.findMany({
    where: { parentId: memberId },
    select: { childId: true },
  })

  if (children.length === 0) {
    return 1 // Leaf node
  }

  let maxChildDepth = 0
  for (const child of children) {
    const depth = await calculateDepth(child.childId, visited)
    if (depth > maxChildDepth) {
      maxChildDepth = depth
    }
  }

  return maxChildDepth + 1
}

// Estimate generations when there are circular references or no clear root
async function estimateGenerationsFromMiddle(): Promise<number> {
  // Get a sample member
  const anyMember = await prisma.member.findFirst()
  if (!anyMember) return 0

  // Count ancestors
  let ancestorCount = 0
  let currentGeneration = [anyMember.id]
  const visited = new Set<string>()

  while (currentGeneration.length > 0) {
    ancestorCount++
    const parents = await prisma.parentChild.findMany({
      where: {
        childId: { in: currentGeneration },
      },
      select: { parentId: true },
    })
    
    currentGeneration = parents
      .map(p => p.parentId)
      .filter(id => !visited.has(id))
    
    currentGeneration.forEach(id => visited.add(id))
  }

  // Count descendants
  let descendantCount = 0
  currentGeneration = [anyMember.id]
  visited.clear()

  while (currentGeneration.length > 0) {
    descendantCount++
    const children = await prisma.parentChild.findMany({
      where: {
        parentId: { in: currentGeneration },
      },
      select: { childId: true },
    })
    
    currentGeneration = children
      .map(c => c.childId)
      .filter(id => !visited.has(id))
    
    currentGeneration.forEach(id => visited.add(id))
  }

  return ancestorCount + descendantCount - 1 // -1 because we counted the starting member twice
}
