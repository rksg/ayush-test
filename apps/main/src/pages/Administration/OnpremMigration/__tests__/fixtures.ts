/* eslint-disable max-len */
export const successResponse = {
  requestId: 'request-id'
}

export const migrations = [
  {
    name: 'migration-001.bak',
    state: 'success',
    startTime: '2023-03-02 02:00:10 UTC',
    endTime: '2023-03-02 03:33:13 UTC',
    summary: 'All 4 APs were migrated to venue migration-P0d5E3J3'
  }
]

export const migrationResult = {
  taskId: '7746d00b-e515-4cf1-b5c6-f09b3047c1a1',
  createTime: 1683625888858,
  state: 'Qualified',
  tenantId: '523227343adc42a7be6f93a45a45285d',
  fileName: 'ruckus_db_042823_18_16.bak',
  apImportResults: [
    {
      serial: '0',
      state: 'Valid'
    },
    {
      serial: '1',
      state: 'Valid'
    },
    {
      serial: '2',
      state: 'Valid'
    },
    {
      serial: '9',
      state: 'Valid'
    }
  ]
}
