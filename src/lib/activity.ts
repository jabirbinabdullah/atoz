import { prisma } from './prisma'

interface LogActivityParams {
  userId?: string
  userName: string
  action: 'created' | 'updated' | 'deleted'
  entityType: 'member' | 'relationship' | 'marriage'
  entityId?: string
  entityName?: string
  details?: Record<string, any>
}

export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activity.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        details: params.details ? JSON.stringify(params.details) : null,
      },
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw - activity logging should not break the main operation
  }
}
