import userEvent from '@testing-library/user-event'

import { defaultNetworkPath }                                    from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }                           from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, fireEvent, waitFor  } from '@acx-ui/test-utils'
import { DateRange }                                             from '@acx-ui/utils'

import { api as incidentApi } from '../IncidentTable/services'

import { networkFilterResult } from './__tests__/fixtures'
import { api, Child }          from './services'
import { NonSelectableItem }   from './styledComponents'

import { NetworkFilter, onApply, getNetworkFilterData } from './index'

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
  range: DateRange.last24Hours
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
  raw: []
}

jest.mock('@acx-ui/reports/utils', () => ({
  ...jest.requireActual('@acx-ui/reports/utils'),
  useReportsFilter: () => mockUseReportsFilter
}))

describe('Network Filter', () => {

  beforeEach(() => {

    store.dispatch(api.util.resetApiState())
    store.dispatch(incidentApi.util.resetApiState())
    jest.clearAllMocks()
  })
  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    render(<Provider><NetworkFilter shouldQuerySwitch/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render network filter', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: { children: null } } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = render(<Provider><NetworkFilter shouldQuerySwitch/></Provider>)
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('span[class="ant-select-arrow"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should select network node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    render(<Provider><NetworkFilter shouldQuerySwitch/></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('venue1'))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'zone', name: 'id3' }
    ]
    const raw = [JSON.stringify(path)]
    expect(mockSetNetworkPath).toHaveBeenCalledTimes(1)
    expect(mockSetNetworkPath).toHaveBeenCalledWith(path, raw)
    await userEvent.click(screen.getByRole('combobox'))
  })
  it('should select network node and bands', async () => {
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
    /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.click(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    fireEvent.click(screen.getByText('swg1'))
    const menuOptions = screen.getAllByRole('menu')
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(menuOptions[1].getElementsByClassName('ant-cascader-checkbox')[1])
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(allOptions[0].children[0])
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(allOptions[2].children[0])
    const band6GHz = screen.getByLabelText('6 GHz')
    const band2_4GHz = screen.getByLabelText('2.4 GHz')
    await userEvent.click(band6GHz)
    await userEvent.click(band2_4GHz)
    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockReportsSetNetworkPath).toBeCalledWith(
      [
        [{
          name: 'Network',
          type: 'network'
        }, {
          name: 'id5',
          type: 'switchGroup'
        }],
        [{
          name: 'Network',
          type: 'network'
        }, {
          name: 'id4',
          type: 'switchGroup'
        }],
        [{
          name: 'Network',
          type: 'network'
        }, {
          name: 'id1',
          type: 'zone'
        }]
      ], ['6', '2.4'], [
        // eslint-disable-next-line max-len
        ['[{"type":"network","name":"Network"},{"type":"switchGroup","name":"id5"}]', 'switchesid5'],
        ['[{"type":"network","name":"Network"},{"type":"switchGroup","name":"id4"}]'],
        ['[{"type":"network","name":"Network"},{"type":"zone","name":"id1"}]']
      ]
    )
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
    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should list only venues having Switches', async () => {
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
    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should select network node and bands with onApplyFn', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = render(<Provider><NetworkFilter
      shouldQuerySwitch
      filterFor='reports'
      showRadioBand={true}
    /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.click(await screen.findByRole('combobox'))
    const band6GHz = screen.getByLabelText('6 GHz')
    const band2_4GHz = screen.getByLabelText('2.4 GHz')
    await userEvent.click(band6GHz)
    await userEvent.click(band2_4GHz)
    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
  })
  it('should not select non-selectable element', async () => {
    const select = jest.fn()
    render(<NonSelectableItem onClick={select}>item</NonSelectableItem>)
    fireEvent.click(screen.getByText('item'))
    expect(select).toBeCalledTimes(0)
  })
  it('should search node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    render(<Provider><NetworkFilter shouldQuerySwitch/></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.type(screen.getByRole('combobox'), 'swg')
    const results = await screen.findAllByRole('menuitemcheckbox')
    await waitFor(() => {expect(results.length).toBeGreaterThan(0)})
    await userEvent.click(results[0])
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'switchGroup', name: 'id4' }
    ]
    const raw = [JSON.stringify(path)]
    expect(mockSetNetworkPath).toHaveBeenCalledTimes(1)
    expect(mockSetNetworkPath).toHaveBeenCalledWith(path, raw)

  })
  it('should correctly call setNetworkPath', () => {
    const setNetworkPath = jest.fn()
    onApply(undefined, setNetworkPath)
    expect(setNetworkPath).toBeCalledWith([], [])
    const path = [JSON.stringify(defaultNetworkPath)]
    onApply(path, setNetworkPath)
    expect(setNetworkPath).toBeCalledWith(defaultNetworkPath, path)
  })

  it('should search node for reports', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    render(<Provider><NetworkFilter filterFor='reports' shouldQuerySwitch/></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.type(screen.getByRole('combobox'), 'swg')
    const results = await screen.findAllByRole('menuitemcheckbox')
    await waitFor(() => {expect(results.length).toBeGreaterThan(0)})
    await userEvent.click(results[0])
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'switchGroup', name: 'id4' }
    ]
    const raw = [JSON.stringify(path)]
    expect(mockSetNetworkPath).toHaveBeenCalledTimes(1)
    expect(mockSetNetworkPath).toHaveBeenCalledWith(path, raw)
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
      data: { network: { hierarchyNode: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = render(
      <Provider>
        <NetworkFilter shouldQuerySwitch withIncidents/>
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
        <NetworkFilter shouldQuerySwitch withIncidents/>
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
          ...networkFilterResult
        }
      }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [mockIncidents[2]] } } }
    })
    const { asFragment } = render(
      <Provider>
        <NetworkFilter shouldQuerySwitch withIncidents/>
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
          ...networkFilterResult
        }
      }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [mockIncidents[2]] } } }
    })
    const { asFragment } = render(
      <Provider>
        <NetworkFilter shouldQuerySwitch withIncidents/>
      </Provider>
    )
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(screen.getByRole('combobox'))
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('getNetworkFilterData', () => {
  it('should not replace venue name with id', () => {
    const data: Child[] = [{
      id: '473f0528888b4e09872b1560711d9dbd',
      type: 'zone',
      name: 'Some Name',
      path: [
        { type: 'network', name: 'Network' },
        { type: 'zone', name: 'Some Name' }
      ],
      aps: [
        { name: 'AP Name', mac: '00:00:00:00:00:00' }
      ],
      switches: [
        { name: 'Switch Name', mac: '11:11:11:11:11:11' }
      ]
    }]
    const [firstItem] = getNetworkFilterData(data, {}, 'both', false)

    /* eslint-disable testing-library/no-node-access */
    const [apItem, switchItem] = firstItem.children!
    expect(JSON.parse(String(firstItem.value))[1].name).toEqual('Some Name')
    expect(apItem.value).toEqual('apsSome Name')
    expect(JSON.parse(String(apItem.children?.[0].value))[1].name).toEqual('Some Name')
    expect(switchItem.value).toEqual('switchesSome Name')
    expect(JSON.parse(String(switchItem.children?.[0].value))[1].name).toEqual('Some Name')
    /* eslint-enable testing-library/no-node-access */
  })
})
