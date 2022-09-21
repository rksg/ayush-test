import userEvent             from '@testing-library/user-event'
import { DefaultOptionType } from 'antd/lib/select'

import { dataApiURL }                                   from '@acx-ui/analytics/services'
import { defaultNetworkPath }                           from '@acx-ui/analytics/utils'
import { Provider, store }                              from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, fireEvent  } from '@acx-ui/test-utils'
import { DateRange }                                    from '@acx-ui/utils'

import { api as incidentApi } from '../IncidentTable/services'

import { networkHierarchy }  from './__tests__/fixtures'
import { api }               from './services'
import { NonSelectableItem } from './styledComponents'

import NetworkFilter, { onApply, displayRender } from './index'

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
const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
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
describe('Network Filter', () => {

  beforeEach(() => {

    store.dispatch(api.util.resetApiState())
    store.dispatch(incidentApi.util.resetApiState())
    jest.clearAllMocks()
  })
  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    render(<Provider><NetworkFilter /></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render network filter', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: { children: null } } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = render(<Provider><NetworkFilter /></Provider>)
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('span[class="ant-select-arrow"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should select network node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    render(<Provider><NetworkFilter /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('venue1'))
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'zone', name: 'venue1' }
    ]
    const raw = [JSON.stringify(path)]
    expect(mockSetNetworkPath).toHaveBeenCalledTimes(1)
    expect(mockSetNetworkPath).toHaveBeenCalledWith(path, raw)
    await userEvent.click(screen.getByRole('combobox'))
  })
  it('should not select non-selectable element', async () => {
    const select = jest.fn()
    render(<NonSelectableItem onClick={select}>item</NonSelectableItem>)
    fireEvent.click(screen.getByText('item'))
    expect(select).toBeCalledTimes(0)
  })
  it('should search node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    render(<Provider><NetworkFilter /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.type(screen.getByRole('combobox'), 'swg')
    await screen.findByText('swg')
    fireEvent.click(screen.getByText('swg'))
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'switchGroup', name: 'swg' }
    ]
    const raw = [JSON.stringify(path)]
    expect(mockSetNetworkPath).toHaveBeenCalledTimes(1)
    expect(mockSetNetworkPath).toHaveBeenCalledWith(path, raw)

  })
  it('should return correct value to render', () => {
    const data = [
      { input: undefined, output: undefined },
      { input: [{ displayLabel: 'dp' }], output: 'dp' },
      { input: [{ label: 'l' }, { label: 'k' }], output: 'l / k' }
    ]
    data.forEach(({ input, output }) => {
      expect(displayRender({}, input as DefaultOptionType[] | undefined)).toEqual(output)
    })
  })
  it('should correctly call setNetworkPath', () => {
    const setNetworkPath = jest.fn()
    onApply(undefined, setNetworkPath)
    expect(setNetworkPath).toBeCalledWith(defaultNetworkPath, [])
    const path = [JSON.stringify(defaultNetworkPath)]
    onApply(path, setNetworkPath)
    expect(setNetworkPath).toBeCalledWith(defaultNetworkPath, path)
  })
})
describe('Network Filter with incident severity', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    store.dispatch(incidentApi.util.resetApiState())

    jest.clearAllMocks()
  })
  it('should render network filter with severity', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = render(
      <Provider>
        <NetworkFilter />
      </Provider>
    )
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(screen.getByRole('combobox'))
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should not show any severity circle when hierarchyNode is empty', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: [] } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = render(
      <Provider>
        <NetworkFilter />
      </Provider>
    )
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(screen.getByRole('combobox'))
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment()).toMatchSnapshot()
  })
  it('should show only venue severities', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: {
        network: {
          hierarchyNode: {
            type: 'zone',
            name: 'venue1',
            path: [...defaultNetworkPath, { type: 'zone', name: 'venue1' }],
            aps: [],
            switches: []
          },
          ...networkHierarchy
        }
      }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [mockIncidents[2]] } } }
    })
    const { asFragment } = render(
      <Provider>
        <NetworkFilter />
      </Provider>
    )
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(screen.getByRole('combobox'))
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment()).toMatchSnapshot()
  })
  it('should show severity only once on each node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: {
        network: {
          hierarchyNode: {
            type: 'zone',
            name: 'venue1',
            path: [...defaultNetworkPath, { type: 'zone', name: 'venue1' }],
            aps: [],
            switches: []
          },
          ...networkHierarchy
        }
      }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [mockIncidents[2]] } } }
    })
    const { asFragment } = render(
      <Provider>
        <NetworkFilter />
      </Provider>
    )
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(screen.getByRole('combobox'))
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment()).toMatchSnapshot()
  })
})
