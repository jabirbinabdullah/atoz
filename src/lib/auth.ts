import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export type Role = 'admin' | 'contributor' | 'viewer'

export async function authorize(requiredRoles: Role[] = []) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  if (requiredRoles.length > 0) {
    const userRole = (session.user as any).role as Role | undefined
    if (!userRole || !requiredRoles.includes(userRole)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }
  }

  return session
}

export function withAuth(handler: Function, requiredRoles: Role[] = []) {
  return async (req: Request, ...args: any[]) => {
    const result = await authorize(requiredRoles)
    if (result instanceof NextResponse) return result
    return handler(req, ...args)
  }
}
