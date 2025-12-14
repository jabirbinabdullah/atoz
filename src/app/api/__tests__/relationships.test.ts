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

import { POST as createParentChild, DELETE as deleteParentChild } from '../relationships/parent-child/route'
import { POST as createMarriage, DELETE as deleteMarriage } from '../relationships/marriages/route'
import prisma from '../../../lib/prisma'

jest.mock('../../../lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      parentChild: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      marriage: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      activity: {
        create: jest.fn(),
      },
    },
  }
})

const prismaMock = prisma as unknown as {
  parentChild: {
    create: jest.Mock
    delete: jest.Mock
  }
  marriage: {
    create: jest.Mock
    delete: jest.Mock
  }
}

const makeReq = (body: unknown) => ({ json: async () => body } as unknown as Request)

describe('relationships API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('prevents parent equals child', async () => {
    const res = await createParentChild(makeReq({ parentId: '1', childId: '1' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBeDefined()
  })

  it('creates parent-child', async () => {
    prismaMock.parentChild.create.mockResolvedValue({
      id: 'pc1',
      parentId: 'p',
      childId: 'c',
      parent: { fullName: 'Parent Name' },
      child: { fullName: 'Child Name' },
    } as any)

    const res = await createParentChild(makeReq({ parentId: 'p', childId: 'c', parentRole: 'father' }))
    const json = await res.json()

    expect(prismaMock.parentChild.create).toHaveBeenCalledWith({
      data: { parentId: 'p', childId: 'c', parentRole: 'father' },
      include: {
        parent: { select: { fullName: true } },
        child: { select: { fullName: true } },
      },
    })
    expect(res.status).toBe(201)
    expect(json.id).toBe('pc1')
  })

  it('deletes parent-child', async () => {
    prismaMock.parentChild.findUnique.mockResolvedValue({
      id: 'pc1',
      parentId: 'p',
      childId: 'c',
      parent: { fullName: 'Parent Name' },
      child: { fullName: 'Child Name' },
    } as any)
    prismaMock.parentChild.delete.mockResolvedValue({} as any)

    const res = await deleteParentChild(makeReq({ parentId: 'p', childId: 'c' }))
    const json = await res.json()

    expect(prismaMock.parentChild.findUnique).toHaveBeenCalled()
    expect(prismaMock.parentChild.delete).toHaveBeenCalledWith({
      where: { parentId_childId: { parentId: 'p', childId: 'c' } },
    })
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
  })

  it('prevents same spouse', async () => {
    const res = await createMarriage(makeReq({ spouseAId: 'x', spouseBId: 'x' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBeDefined()
  })

  it('creates marriage', async () => {
    prismaMock.marriage.create.mockResolvedValue({
      id: 'm1',
      spouseAId: 'a',
      spouseBId: 'b',
      spouseA: { fullName: 'Spouse A' },
      spouseB: { fullName: 'Spouse B' },
    } as any)

    const res = await createMarriage(makeReq({ spouseAId: 'a', spouseBId: 'b', notes: 'note' }))
    const json = await res.json()

    expect(prismaMock.marriage.create).toHaveBeenCalledWith({
      data: {
        spouseAId: 'a',
        spouseBId: 'b',
        marriageDate: null,
        divorceDate: null,
        notes: 'note',
      },
      include: {
        spouseA: { select: { fullName: true } },
        spouseB: { select: { fullName: true } },
      },
    })
    expect(res.status).toBe(201)
    expect(json.id).toBe('m1')
  })

  it('deletes marriage', async () => {
    prismaMock.marriage.findUnique.mockResolvedValue({
      id: 'm1',
      spouseAId: 'a',
      spouseBId: 'b',
      spouseA: { fullName: 'Spouse A' },
      spouseB: { fullName: 'Spouse B' },
    } as any)
    prismaMock.marriage.delete.mockResolvedValue({} as any)

    const res = await deleteMarriage(makeReq({ spouseAId: 'a', spouseBId: 'b' }))
    const json = await res.json()

    expect(prismaMock.marriage.findUnique).toHaveBeenCalled()
    expect(prismaMock.marriage.delete).toHaveBeenCalledWith({
      where: { spouseAId_spouseBId: { spouseAId: 'a', spouseBId: 'b' } },
    })
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
  })
})
