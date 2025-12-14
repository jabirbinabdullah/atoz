import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Get all living members with birth dates
    const members = await prisma.member.findMany({
      where: {
        isAlive: true,
        birthDate: {
          not: null,
        },
      },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
      },
    })

    // Calculate upcoming birthdays within 30 days
    const upcomingBirthdays = members
      .map((member) => {
        if (!member.birthDate) return null

        const birthDate = new Date(member.birthDate)
        const currentYear = now.getFullYear()
        
        // Create birthday for this year
        let nextBirthday = new Date(
          currentYear,
          birthDate.getMonth(),
          birthDate.getDate()
        )

        // If birthday already passed this year, use next year
        if (nextBirthday < now) {
          nextBirthday = new Date(
            currentYear + 1,
            birthDate.getMonth(),
            birthDate.getDate()
          )
        }

        // Calculate days until birthday
        const daysUntil = Math.ceil(
          (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Only include if within 30 days
        if (daysUntil <= 30 && daysUntil >= 0) {
          return {
            id: member.id,
            fullName: member.fullName,
            birthDate: member.birthDate,
            nextBirthday: nextBirthday.toISOString(),
            daysUntil,
          }
        }

        return null
      })
      .filter((b) => b !== null)
      .sort((a, b) => a!.daysUntil - b!.daysUntil)

    return NextResponse.json({
      birthdays: upcomingBirthdays,
      count: upcomingBirthdays.length,
    })
  } catch (error) {
    console.error('Dashboard birthdays error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upcoming birthdays' },
      { status: 500 }
    )
  }
}
