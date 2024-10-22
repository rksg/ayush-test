import { Intent }         from '../../useIntentDetailsQuery'
import { categoryStyles } from '../ComparisonDonutChart/services'

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
  }
} as unknown as Intent

export const mockKpiData = {
  kpi: {
    data: {
      timestamp: '2024-09-25T03:16:17.999Z',
      result: {
        unsupported: 10,
        enabled: 10,
        disabled: 40
      }
    },
    compareData: {
      timestamp: '2024-09-24T03:16:17.999Z',
      result: {
        unsupported: 10,
        enabled: 20,
        disabled: 30
      }
    }
  }
}

export const mockKpiResultData = {
  data: {
    timestamp: '2024-09-25T03:16:17.999Z',
    data: [ { value: 10,
      name: 'are not supporting EcoFlex.',
      color: categoryStyles[0].color
    },
    { value: 15,
      name: 'are not supporting and disabling EcoFlex.',
      color: categoryStyles[1].color
    },
    { value: 35,
      name: 'are not supporting and enabling EcoFlex.',
      color: categoryStyles[2].color
    }]
  },
  compareData: {
    timestamp: '2024-09-24T03:16:17.999Z',
    data: [ { value: 10,
      name: 'are not supporting EcoFlex.',
      color: categoryStyles[0].color
    },
    { value: 20,
      name: 'are not supporting and disabling EcoFlex.',
      color: categoryStyles[1].color
    },
    { value: 30,
      name: 'are not supporting and enabling EcoFlex.',
      color: categoryStyles[2].color
    }]
  }
}
