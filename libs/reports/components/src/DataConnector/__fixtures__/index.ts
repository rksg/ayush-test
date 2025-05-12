import { AuditDto, AuditStatusEnum, DataConnector } from '../types'

export const mockedUserId = 'userId-fake'
export const mockedConnectors = [
  ...Array(9)
    .fill(null)
    .map((_, index) => ({
      id: `id-${index}`,
      name: `dataConnector-${index}`,
      userId: mockedUserId,
      userName: 'userName-fake',
      columns: [`column-${index}`],
      status: Boolean(index % 2),
      frequency: 'daily',
      updatedAt: new Date().toISOString()
    })),
  // not owned by user
  {
    id: 'id-9',
    name: 'dataConnector-9',
    userId: 'another-user-id',
    userName: 'another-userName-fake',
    columns: ['column-9'],
    status: true,
    frequency: 'daily',
    updatedAt: new Date().toISOString()
  }
] as DataConnector[]

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
  // Failure, not retryable (Quota exceeded)
  {
    id: 'id-5',
    status: AuditStatusEnum.Failure,
    error: 'Used (528190878) is >= quota (524288000)',
    size: 0,
    start: '2025-01-10T02:48:40.069Z',
    end: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]
