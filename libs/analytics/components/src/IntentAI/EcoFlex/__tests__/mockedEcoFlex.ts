/* eslint-disable max-len */
import { cssStr } from '@acx-ui/components'

import { IntentDetail } from '../../useIntentDetailsQuery'

export const mocked = {
  id: '2c392d0a-124f-4183-b5c4-529d6571f540',
  root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
  code: 'i-ecoflex',
  sliceId: 'bedbebbd-1a8d-4615-a468-d54b85323ca3',
  status: 'new',
  sliceType: 'Yakubpur-MH',
  sliceValue: 'My-Venue',
  updatedAt: '2024-06-14T08:30:39.214Z',
  dataEndTime: '2024-06-09T00:00:00.000Z',
  path: [
    { type: 'system', name: 'vsz-bruce' },
    { type: 'zone', name: 'weiguo-mesh' }
  ],
  statusTrail: [
    { status: 'new', createdAt: '2024-04-03T06:03:59.617Z' }
  ],
  metadata: {
    scheduledAt: '2024-08-08T12:00:00.000Z',
    dataEndTime: '2024-07-06T12:00:00.000Z'
  },
  kpi: {
    data: {
      timestamp: '2024-09-25T03:16:17.999Z',
      result: {
        unsupported: 4,
        enabled: 2,
        disabled: 30
      }
    },
    compareData: {
      timestamp: '2024-09-24T03:16:17.999Z',
      result: {
        unsupported: 4,
        enabled: 1,
        disabled: 31
      }
    }
  },
  dataCheck: {
    isDataRetained: true,
    isHotTierData: true
  }
} as unknown as IntentDetail
export const mockNetworkHierarchy = {
  network: {
    venueHierarchy: [{
      id: 'id1',
      name: 'Venue 1',
      aps: [
        { name: 'AP 1', mac: '00:00:00:00:00:01', model: 'R350', firmware: '6.2.1.103.2538', serial: '431802006001' },
        { name: 'AP 2', mac: '00:00:00:00:00:02', model: 'R350', firmware: '6.2.1.103.2538', serial: '431802006002' }
      ]
    }, {
      id: 'id2',
      name: 'Venue 2',
      aps: [
        { name: 'AP 3', mac: '00:00:00:00:00:03', model: 'R350', firmware: '6.2.1.103.2538', serial: '431802006003' },
        { name: 'AP 4', mac: '00:00:00:00:00:04', model: 'R350', firmware: '6.2.1.103.2538', serial: '431802006004' },
        { name: 'AP 5', mac: '00:00:00:00:00:05', model: 'R350', firmware: '6.2.1.103.2538', serial: '431802006005' }
      ]
    }]
  }
}
export const mockApHierarchy = {
  network: {
    apHierarchy: [{ name: 'system 1', type: 'system',
      children: [
        { name: '1||Administration Domain', type: 'domain',
          children: [{ name: 'zone 1', type: 'zone',
            children: [{ name: 'group 1', type: 'apGroup' }]
          }] },
        {
          name: '2||domain', type: 'domain',
          children: [{ name: 'zone 2', type: 'zone',
            children: [{ name: 'group 2', type: 'apGroup',
              children: [
                { name: 'ap 1', type: 'ap', mac: '00:00:00:00:00:01', model: 'R350', firmware: '6.2.1.103.253' },
                { name: 'ap 2', type: 'ap', mac: '00:00:00:00:00:02', model: 'R350', firmware: '6.2.1.103.253' },
                { name: 'ap 3', type: 'ap', mac: '00:00:00:00:00:03', model: 'R500', firmware: '6.2.1.103.253' },
                { name: 'ap 4', type: 'ap', mac: '00:00:00:00:00:04', model: 'R760', firmware: '6.0.0.0.0' },
                { name: 'ap 5', type: 'ap', mac: '00:00:00:00:00:05', model: 'R350', firmware: '6.2.1.103.253' },
                { name: 'ap 6', type: 'ap', mac: 'Unknown', model: 'Unknown', firmware: 'Unknown' }
              ] },
            { name: 'group 4', type: 'apGroup' }
            ]
          }]
        }]
    },
    { name: 'system 2', type: 'system', children: [] },
    { name: 'system 3', type: 'system', children: [{ name: 'zone 1', type: 'zone' }] },
    { name: 'system 4', type: 'system', children: [] },
    { name: 'system 5', type: 'system', children: [{ name: 'zone 1', type: 'zone' }] }
    ] }
}

export const mockKpiData = {
  kpi: {
    data: {
      timestamp: '2024-09-25T03:16:17.999Z',
      result: {
        unsupported: 10,
        enabled: 10,
        disabled: 40,
        projectedPowerSaving: 15.1,
        powerConsumption: 48,
        maxApPower: 20,
        minApPower: 10
      }
    },
    compareData: {
      timestamp: '2024-09-24T03:16:17.999Z',
      result: {
        unsupported: 10,
        enabled: 20,
        disabled: 30,
        projectedPowerSaving: 30.2,
        powerConsumption: 50,
        maxApPower: 20,
        minApPower: 5
      }
    }
  }
}

export const mockKpiResultDataWithUnknownField = {
  kpi: {
    data: {
      result: {
        xxx: 10
      }
    },
    compareData: {
    }
  }
}

export const mockKpiResultData = {
  data: {
    timestamp: '2024-09-25T03:16:17.999Z',
    data: [ { value: 10,
      name: 'are not supporting Energy Saving.',
      color: cssStr('--acx-viz-qualitative-1')
    },
    { value: 15,
      name: 'are not supporting and disabling Energy Saving.',
      color: cssStr('--acx-semantics-green-30')
    },
    { value: 35,
      name: 'are not supporting and enabling Energy Saving.',
      color: cssStr('--acx-accents-orange-50')
    }]
  },
  compareData: {
    timestamp: '2024-09-24T03:16:17.999Z',
    data: [ { value: 10,
      name: 'are not supporting Energy Saving.',
      color: cssStr('--acx-viz-qualitative-1')
    },
    { value: 20,
      name: 'are not supporting and disabling Energy Saving.',
      color: cssStr('--acx-semantics-green-30')
    },
    { value: 30,
      name: 'are not supporting and enabling Energy Saving.',
      color: cssStr('--acx-accents-orange-50')
    }]
  }
}

export const mockNetworkNodes = [
  {
    name: 'default',
    type: 'apGroup',
    children: [
      {
        type: 'AP',
        name: 'T670-22',
        mac: '80:F0:CF:3E:60:00'
      },
      {
        type: 'AP',
        name: 'R750-201',
        mac: '94:B3:4F:3D:21:70'
      },
      {
        type: 'AP',
        name: 'H550-163',
        mac: 'B4:79:C8:3E:95:20'
      },
      {
        type: 'AP',
        name: 'R770-153',
        mac: 'B4:79:C8:3E:E5:80'
      },
      {
        type: 'AP',
        name: 'R760-96',
        mac: 'C0:C7:0A:21:26:C0'
      }
    ]
  }
]


export const mockedKpiData = {
  data: {
    timestamp: '2025-04-01T00:00:00Z',
    data: {
      projectedPowerSaving: 15.1,
      enabled: 80,
      disabled: 10,
      unsupported: 10,
      powerConsumption: 48,
      maxApPower: 20,
      minApPower: 10,
      apTotalCount: 100
    }
  },
  compareData: {
    timestamp: '2025-03-01T00:00:00Z',
    data: {
      projectedPowerSaving: 30.2,
      enabled: 10,
      disabled: 80,
      unsupported: 10,
      powerConsumption: 50,
      maxApPower: 20,
      minApPower: 5,
      apTotalCount: 100
    }
  }
}