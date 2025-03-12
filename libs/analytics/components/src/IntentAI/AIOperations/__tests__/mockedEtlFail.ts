export const mockedEtlFail = {
  intent: {
    root: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8',
    sliceId: 'f3f207c0-776c-4ce7-9e6f-d12d9b9f0fe1',
    code: 'c-bandbalancing-enable',
    id: 'aea148e1-05a1-4ffa-a866-2a21cd69fba6',
    metadata: {
      failures: [],
      dataEndTime: 1722902400000,
      scheduledAt: '2024-08-07T04:30:00.000Z',
      scheduledBy: '003O300000FXA6sIAH',
      config_backup: {
        loadBalancing: {
          bandBalancing: 'null'
        }
      }
    },
    preferences: null,
    status: 'active',
    statusReason: null,
    displayStatus: 'active',
    sliceType: 'zone',
    sliceValue: '14-US-CA-D14-Ken-Home',
    updatedAt: '2024-08-07T04:30:33.273Z',
    path: [
      {
        type: 'system',
        name: 'vsz34'
      },
      {
        type: 'domain',
        name: '14-US-CA-D14-Ken-Home'
      },
      {
        type: 'zone',
        name: '14-US-CA-D14-Ken-Home'
      }
    ],
    statusTrail: [
      {
        status: 'active',
        statusReason: null,
        displayStatus: 'active',
        createdAt: '2024-08-07T04:30:33.273Z'
      },
      {
        status: 'applyscheduleinprogress',
        statusReason: null,
        displayStatus: 'applyscheduleinprogress',
        createdAt: '2024-08-07T04:30:02.196Z'
      },
      {
        status: 'applyscheduled',
        statusReason: null,
        displayStatus: 'applyscheduled',
        createdAt: '2024-08-07T04:13:18.596Z'
      },
      {
        status: 'new',
        statusReason: null,
        displayStatus: 'new',
        createdAt: '2024-07-30T06:05:09.787Z'
      }
    ],
    kpi_client_ratio: null,
    currentValue: true,
    recommendedValue: true,
    dataCheck: {
      isDataRetained: true,
      isHotTierDate: true
    }
  }
}