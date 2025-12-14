jest.mock('next/server', () => {
  class MockNextResponse {
    status: number
    body: any
    constructor(body: any, init?: { status?: number }) {
      this.body = body
      this.status = init?.status ?? 200
    }
    async json() {
      return this.body
    }
    static json(data: any, init?: { status?: number }) {
      return new MockNextResponse(data, init)
    }
  }

  return { NextResponse: MockNextResponse }
})

jest.mock('../../../lib/prisma', () => {
  return {
    __esModule: true,
    prisma: {
      member: {
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      parentChild: {
        findMany: jest.fn(),
      },
    },
  }
})

import { GET as getStats } from '../dashboard/stats/route'
import { GET as getBirthdays } from '../dashboard/birthdays/route'
import { prisma } from '../../../lib/prisma'

describe('Dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/dashboard/stats', () => {
    it('returns dashboard statistics', async () => {
      // Mock Prisma responses
      ;(prisma.member.count as jest.Mock)
        .mockResolvedValueOnce(47) // totalMembers
        .mockResolvedValueOnce(32) // livingMembers
        .mockResolvedValueOnce(3) // membersThisMonth

      ;(prisma.member.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'ancestor1' },
        { id: 'ancestor2' },
      ])

      ;(prisma.parentChild.findMany as jest.Mock)
        .mockResolvedValueOnce([{ childId: 'child1' }]) // First ancestor has 1 child
        .mockResolvedValueOnce([]) // child1 has no children (depth = 2)
        .mockResolvedValueOnce([{ childId: 'child2' }, { childId: 'child3' }]) // Second ancestor has 2 children
        .mockResolvedValueOnce([{ childId: 'grandchild1' }]) // child2 has 1 child
        .mockResolvedValueOnce([]) // grandchild1 has no children (depth = 3)
        .mockResolvedValueOnce([]) // child3 has no children

      const response = await getStats()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        totalMembers: 47,
        livingMembers: 32,
        generations: 3,
        membersThisMonth: 3,
      })
    })

    it('handles error gracefully', async () => {
      ;(prisma.member.count as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      )

      const response = await getStats()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch dashboard statistics')
    })

    it('handles case with no ancestors', async () => {
      ;(prisma.member.count as jest.Mock)
        .mockResolvedValueOnce(10) // totalMembers
        .mockResolvedValueOnce(8) // livingMembers
        .mockResolvedValueOnce(2) // membersThisMonth

      ;(prisma.member.findMany as jest.Mock).mockResolvedValueOnce([]) // No ancestors
      ;(prisma.member.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'member1' })

      // Mock for estimating generations
      ;(prisma.parentChild.findMany as jest.Mock)
        .mockResolvedValueOnce([{ parentId: 'parent1' }]) // Going up
        .mockResolvedValueOnce([{ parentId: 'grandparent1' }])
        .mockResolvedValueOnce([]) // No more parents
        .mockResolvedValueOnce([{ childId: 'child1' }]) // Going down
        .mockResolvedValueOnce([])

      const response = await getStats()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalMembers).toBe(10)
    })
  })

  describe('GET /api/dashboard/birthdays', () => {
    it('returns upcoming birthdays sorted by date', async () => {
      const now = new Date('2025-12-14')
      jest.useFakeTimers()
      jest.setSystemTime(now)

      const mockMembers = [
        {
          id: 'member1',
          fullName: 'John Doe',
          birthDate: new Date('1980-12-20'), // 6 days away
        },
        {
          id: 'member2',
          fullName: 'Jane Smith',
          birthDate: new Date('1985-12-25'), // 11 days away
        },
        {
          id: 'member3',
          fullName: 'Bob Johnson',
          birthDate: new Date('1990-12-15'), // 1 day away
        },
      ]

      ;(prisma.member.findMany as jest.Mock).mockResolvedValueOnce(mockMembers)

      const response = await getBirthdays()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.count).toBe(3)
      expect(data.birthdays).toHaveLength(3)
      
      // Should be sorted by days until
      expect(data.birthdays[0].fullName).toBe('Bob Johnson')
      expect(data.birthdays[0].daysUntil).toBe(1)
      expect(data.birthdays[1].fullName).toBe('John Doe')
      expect(data.birthdays[1].daysUntil).toBe(6)
      expect(data.birthdays[2].fullName).toBe('Jane Smith')
      expect(data.birthdays[2].daysUntil).toBe(11)

      jest.useRealTimers()
    })

    it('excludes birthdays beyond 30 days', async () => {
      const now = new Date('2025-12-14')
      jest.useFakeTimers()
      jest.setSystemTime(now)

      const mockMembers = [
        {
          id: 'member1',
          fullName: 'John Doe',
          birthDate: new Date('1980-12-20'), // 6 days away
        },
        {
          id: 'member2',
          fullName: 'Jane Smith',
          birthDate: new Date('1985-02-15'), // 63 days away (next year)
        },
      ]

      ;(prisma.member.findMany as jest.Mock).mockResolvedValueOnce(mockMembers)

      const response = await getBirthdays()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.count).toBe(1)
      expect(data.birthdays).toHaveLength(1)
      expect(data.birthdays[0].fullName).toBe('John Doe')

      jest.useRealTimers()
    })

    it('handles birthdays that already passed this year', async () => {
      const now = new Date('2025-12-14')
      jest.useFakeTimers()
      jest.setSystemTime(now)

      const mockMembers = [
        {
          id: 'member1',
          fullName: 'John Doe',
          birthDate: new Date('1980-01-10'), // Passed this year, will be next year (27 days)
        },
      ]

      ;(prisma.member.findMany as jest.Mock).mockResolvedValueOnce(mockMembers)

      const response = await getBirthdays()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.count).toBe(1)
      expect(data.birthdays[0].daysUntil).toBe(27)

      jest.useRealTimers()
    })

    it('returns empty array when no upcoming birthdays', async () => {
      ;(prisma.member.findMany as jest.Mock).mockResolvedValueOnce([])

      const response = await getBirthdays()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.count).toBe(0)
      expect(data.birthdays).toHaveLength(0)
    })

    it('handles error gracefully', async () => {
      ;(prisma.member.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      )

      const response = await getBirthdays()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch upcoming birthdays')
    })
  })
})
