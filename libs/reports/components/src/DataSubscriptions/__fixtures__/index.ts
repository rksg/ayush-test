import { AuditDto, AuditStatusEnum, DataSubscription } from '../types'

export const mockedUserId = 'userId-fake'
export const mockedSubscriptions = Array(10).fill(null).map((_, index) => ({
  id: `id-${index}`,
  name: `dataSubscription-${index}`,
  userId: mockedUserId,
  userName: 'userName-fake',
  columns: [`column-${index}`],
  status: Boolean(index % 2),
  frequency: 'daily',
  updatedAt: new Date().toISOString()
})) as DataSubscription[]

// now = '2025-01-20T02:48:40.069Z'
export const mockAuditLogs: AuditDto[] = [
  // Success, retryable
  {
    id: 'id-0',
    status: AuditStatusEnum.Success,
    size: 10000000,
    start: '2025-01-20T02:48:40.069Z',
    end: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Failure, retryable
  {
    id: 'id-1',
    status: AuditStatusEnum.Failure,
    size: 10000000,
    start: '2025-01-20T02:48:40.069Z',
    end: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Scheduled
  {
    id: 'id-2',
    status: AuditStatusEnum.Scheduled,
    size: 10000000,
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // In progress
  {
    id: 'id-3',
    status: AuditStatusEnum.InProgress,
    size: 10000000,
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Success, not retryable (start > 3 days ago)
  {
    id: 'id-4',
    status: AuditStatusEnum.Success,
    size: 10000000,
    start: '2025-01-10T02:48:40.069Z',
    end: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Failure, not retryable (start > 3 days ago)
  {
    id: 'id-5',
    status: AuditStatusEnum.Failure,
    size: 10000000,
    start: '2025-01-10T02:48:40.069Z',
    end: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]