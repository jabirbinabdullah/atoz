import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      activities,
      count: activities.length,
    })
  } catch (error) {
    console.error('Dashboard activities error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
