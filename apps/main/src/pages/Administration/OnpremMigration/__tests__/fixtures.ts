/* eslint-disable max-len */
export const successResponse = {
  requestId: 'request-id'
}

export const venuelist = {
  totalCount: 10,
  page: 1,
  data: [
    {
      city: 'New York',
      country: 'United States',
      description: 'My-Venue',
      id: '2c16284692364ab6a01f4c60f5941836',
      latitude: '40.769141',
      longitude: '-73.9429713',
      name: 'My-Venue',
      status: '1_InSetupPhase',
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 }
    },
    {
      city: 'Sunnyvale, California',
      country: 'United States',
      description: '',
      id: 'a919812d11124e6c91b56b9d71eacc31',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      name: 'test',
      status: '1_InSetupPhase',
      switchClients: 2,
      switches: 1,
      edges: 3,
      clients: 1
    }
  ]
}

export const migrations = [
  {
    taskId: '3e6e39c9-20a5-462f-a924-e0cba0f1172f',
    createTime: 1683625826145,
    state: 'Qualified',
    tenantId: '523227343adc42a7be6f93a45a45285d',
    fileName: 'ruckus_db_042823_18_16.bak',
    apImportResults: [
      {
        serial: '0',
        apName: 'ap-0',
        state: 'Valid',
        validationErrors: ''
      }
    ]
  },
  {
    taskId: '3e6e39c9-20a5-462f-a924-e0cba0f11722',
    completedTime: 1683625826145,
    state: 'Qualified',
    tenantId: '523227343adc42a7be6f93a45a45285d',
    apImportResults: [
      {
        serial: '0',
        apName: 'ap-0',
        state: 'Valid',
        validationErrors: ''
      }
    ]
  }
]

export const configurations = {
  data: [
    {
      taskId: '3e6e39c9-20a5-462f-a924-e0cba0f1172f',
      createTime: 1683625826145,
      state: 'Qualified',
      tenantId: '523227343adc42a7be6f93a45a45285d',
      fileName: 'ruckus_db_042823_18_16.bak',
      apImportResults: [
        {
          serial: '0',
          apName: 'ap-0',
          state: 'Valid',
          validationErrors: ''
        }
      ]
    },
    {
      taskId: '3e6e39c9-20a5-462f-a924-e0cba0f11722',
      completedTime: 1683625826145,
      state: 'Qualified',
      tenantId: '523227343adc42a7be6f93a45a45285d',
      apImportResults: [
        {
          serial: '0',
          apName: 'ap-0',
          state: 'Valid',
          validationErrors: ''
        }
      ]
    }
  ]
}

export const migrationResult = {
  taskId: '7746d00b-e515-4cf1-b5c6-f09b3047c1a1',
  createTime: 1683625888858,
  state: 'Qualified',
  tenantId: '523227343adc42a7be6f93a45a45285d',
  fileName: 'ruckus_db_042823_18_16.bak',
  apImportResults: [
    {
      serial: '0',
      apName: 'ap-0',
      description: 'description',
      state: 'Completed',
      validationErrors: ''
    }
  ]
}

export const configurationResult = {
  data: [{
    migrationTaskList: [{
      taskId: '7746d00b-e515-4cf1-b5c6-f09b3047c1a1',
      createTime: 1683625888858,
      state: 'Qualified',
      tenantId: '523227343adc42a7be6f93a45a45285d',
      fileName: 'ruckus_db_042823_18_16.bak',
      apImportResultList: [
        {
          serial: '0',
          apName: 'ap-0',
          description: 'description',
          state: 'Completed',
          validationErrors: ''
        }
      ]
    }]
  }]
}
