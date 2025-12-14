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

jest.mock('../../../lib/auth', () => ({
  authorize: jest.fn(async () => ({ user: { id: 'user1', familyId: 'fam1', role: 'admin' } })),
}))

import { GET as listMembers, POST as createMember } from '../members/route'
import { GET as getMember, PATCH as updateMember, DELETE as deleteMember } from '../members/[id]/route'
import prisma from '../../../lib/prisma'

jest.mock('../../../lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      member: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    },
  }
})

const prismaMock = prisma as unknown as {
  member: {
    findMany: jest.Mock
    findFirst: jest.Mock
    create: jest.Mock
    findUnique: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
}

const makeReq = (body: unknown) => ({ json: async () => body } as unknown as Request)

describe('members API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns list of members', async () => {
    prismaMock.member.findMany.mockResolvedValue([{ id: '1', fullName: 'Alice', isAlive: true }])

    const res = await listMembers({ url: 'http://localhost/api/members' } as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual([{ id: '1', fullName: 'Alice', isAlive: true }])
  })

  it('creates a member', async () => {
    prismaMock.member.create.mockResolvedValue({ id: '2', fullName: 'Bob', isAlive: true })

    const res = await createMember(makeReq({ fullName: 'Bob' }))
    const json = await res.json()

    expect(prismaMock.member.create).toHaveBeenCalledWith({
      data: {
        fullName: 'Bob',
        gender: null,
        birthDate: null,
        deathDate: null,
        birthPlace: null,
        address: null,
        occupation: null,
        phone: null,
        email: null,
        photoUrl: null,
        notes: null,
        isAlive: true,
        familyId: 'fam1',
        createdByUserId: 'user1',
      },
    })
    expect(res.status).toBe(201)
    expect(json.fullName).toBe('Bob')
  })

  it('updates a member', async () => {
    prismaMock.member.update.mockResolvedValue({ id: '1', fullName: 'Alice Updated', isAlive: false })

    const res = await updateMember(makeReq({ fullName: 'Alice Updated', isAlive: false }), {
      params: { id: '1' },
    } as any)
    const json = await res.json()

    expect(prismaMock.member.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        fullName: 'Alice Updated',
        gender: undefined,
        birthDate: undefined,
        deathDate: undefined,
        birthPlace: undefined,
        address: undefined,
        occupation: undefined,
        phone: undefined,
        email: undefined,
        photoUrl: undefined,
        notes: undefined,
        isAlive: false,
      },
    })
    expect(res.status).toBe(200)
    expect(json.fullName).toBe('Alice Updated')
  })

  it('deletes a member', async () => {
    prismaMock.member.delete.mockResolvedValue({ id: '1' })

    const res = await deleteMember({} as any, { params: { id: '1' } } as any)
    const json = await res.json()

    expect(prismaMock.member.delete).toHaveBeenCalledWith({ where: { id: '1' } })
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
  })

  it('returns 404 when member not found', async () => {
    prismaMock.member.findFirst.mockResolvedValue(null)

    const res = await getMember({ url: 'http://localhost/api/members/missing' } as any, {
      params: { id: 'missing' },
    } as any)
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toBeDefined()
  })
})
