import userEvent from '@testing-library/user-event'

import { defaultNetworkPath }                from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }       from '@acx-ui/store'
import { mockGraphqlQuery, render, screen  } from '@acx-ui/test-utils'
import { DateRange }                         from '@acx-ui/utils'
import type { AnalyticsFilter }              from '@acx-ui/utils'

import { api as incidentApi } from '../IncidentTable/services'

import { networkFilterResult } from './__tests__/fixtures'
import { api }                 from './services'

import { NetworkFilter } from './index'

const mockIncidents = [
  {
    severity: 0.5,
    startTime: '2022-08-03T05:45:00.000Z',
    endTime: '2022-08-03T05:54:00.000Z',
    code: 'radius-failure',
    sliceType: 'ap',
    sliceValue: 'r710_!216',
    id: 'c5917024-fd4f-4e11-b65d-610f0251242b',
    path: [...defaultNetworkPath, { type: 'zone', name: 'venue' }, { type: 'ap', name: 'ap-mac' }],
    metadata: {},
    clientCount: 3,
    impactedClientCount: 2,
    isMuted: false,
    mutedBy: null,
    mutedAt: null
  },
  {
    severity: 0.65,
    startTime: '2022-07-21T08:12:00.000Z',
    endTime: '2022-07-21T08:21:00.000Z',
    code: 'auth-failure',
    sliceType: 'ap',
    sliceValue: 'Unknown',
    id: '24e8e00b-2564-4ce9-8933-c153273dfe2d',
    path: [
      ...defaultNetworkPath,
      { type: 'zone', name: 'venue' },
      { type: 'ap', name: 'ap-mac2' }
    ],

    metadata: {},
    clientCount: 4,
    impactedClientCount: 2,
    isMuted: true,
    mutedBy: null,
    mutedAt: null
  },
  {
    severity: 0.85,
    startTime: '2022-08-03T05:45:00.000Z',
    endTime: '2022-08-03T05:54:00.000Z',
    code: 'radius-failure',
    sliceType: 'zone',
    sliceValue: 'r710_!21690',
    id: 'c5917024-fd4f-4e11-b65d-610f0251242b123',
    path: [...defaultNetworkPath, { type: 'zone', name: 'venue' }],
    metadata: {
      dominant: {
        ssid: 'test'
      },
      rootCauseChecks: {
        checks: [
          {
            CCD_REASON_AAA_AUTH_FAIL: true
          }
        ],
        params: {}
      }
    },
    clientCount: 3,
    impactedClientCount: 2,
    isMuted: false,
    mutedBy: null,
    mutedAt: null
  },
  {
    severity: 0.1,
    startTime: '2022-08-03T05:45:00.000Z',
    endTime: '2022-08-03T05:54:00.000Z',
    code: 'radius-failure',
    sliceType: 'ap',
    sliceValue: 'r710_!21690',
    id: 'c5917024-fd4f-4e11-b65d-610f0251242b12sd3',
    path: [...defaultNetworkPath],
    metadata: {
      dominant: {
        ssid: 'test'
      },
      rootCauseChecks: {
        checks: [
          {
            CCD_REASON_AAA_AUTH_FAIL: true
          }
        ],
        params: {}
      }
    },
    clientCount: 3,
    impactedClientCount: 2,
    isMuted: false,
    mutedBy: null,
    mutedAt: null
  }
]
const mockSetNetworkPath = jest.fn()
const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}
const mockUseAnalyticsFilter = {
  filters,
  setNetworkPath: mockSetNetworkPath,
  raw: []
}

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  defaultNetworkPath: [{ type: 'network', name: 'Network' }],
  formattedPath: jest.fn(),
  useAnalyticsFilter: () => mockUseAnalyticsFilter
}))

const mockReportsSetNetworkPath = jest.fn()

const reportsFilters = {
  paths: [[{ type: 'network', name: 'Network' }]],
  bands: []
}

const mockUseReportsFilter = {
  filters: reportsFilters,
  setNetworkPath: mockReportsSetNetworkPath,
  raw: [
    // eslint-disable-next-line max-len
    ['[{"type":"network","name":"Network"},{"type":"zone","name":"id3"}]'],
    ['[{"type":"network","name":"Network"},{"type":"switchGroup","name":"id2"}]']
  ]
}

jest.mock('@acx-ui/reports/utils', () => ({
  ...jest.requireActual('@acx-ui/reports/utils'),
  useReportsFilter: () => mockUseReportsFilter
}))

describe('Network Filter:Reports Specific', () => {

  beforeEach(() => {

    store.dispatch(api.util.resetApiState())
    store.dispatch(incidentApi.util.resetApiState())
    jest.clearAllMocks()
  })

  it('should list only venues having APs', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = render(<Provider><NetworkFilter
      shouldQuerySwitch
      showRadioBand={true}
      filterFor='reports'
      filterMode={'ap'}
    /></Provider>)
    await screen.findByTitle('venue1')
    await userEvent.click(screen.getByRole('combobox'))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should list only switch venues having Switches', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = render(<Provider><NetworkFilter
      shouldQuerySwitch
      showRadioBand={true}
      filterFor='reports'
      filterMode={'switch'}
    /></Provider>)
    await screen.findByTitle('venue')
    await userEvent.click(screen.getByRole('combobox'))
    expect(asFragment()).toMatchSnapshot()
  })
})
