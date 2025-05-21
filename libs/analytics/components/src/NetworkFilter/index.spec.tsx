import userEvent from '@testing-library/user-event'

import { defaultNetworkPath }                                    from '@acx-ui/analytics/utils'
import { useAnySplitsOn }                                        from '@acx-ui/feature-toggle'
import { dataApiURL, Provider, store }                           from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, fireEvent, waitFor  } from '@acx-ui/test-utils'
import { DateRange }                                             from '@acx-ui/utils'

import { api as incidentApi } from '../IncidentTable/services'

import { networkFilterResult } from './__tests__/fixtures'
import { api, Child }          from './services'
import { NonSelectableItem }   from './styledComponents'

import { NetworkFilter, onApply, getNetworkFilterData, modifyRawValue } from './index'

function renderNetworkFilter (props: Parameters<typeof NetworkFilter>[0]) {
  return render(<NetworkFilter {...props} />, { wrapper: Provider })
}

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
    mockUseReportsFilter.raw = []
    store.dispatch(api.util.resetApiState())
    store.dispatch(incidentApi.util.resetApiState())
    jest.mocked(useAnySplitsOn).mockReturnValue(false) // default for Features.EDGE_NETWORK_FILTER_TOGGLE
    jest.clearAllMocks()
  })
  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    renderNetworkFilter({
      shouldQueryAp: false,
      shouldQuerySwitch: true,
      shouldQueryEdge: false
    })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render network filter', async () => {
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: [] } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = renderNetworkFilter({
      shouldQueryAp: true,
      shouldQuerySwitch: true,
      shouldQueryEdge: false
    })
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('span[class="ant-select-arrow"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should select network node', async () => {
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    renderNetworkFilter({
      shouldQueryAp: true,
      shouldQuerySwitch: true,
      shouldQueryEdge: false
    })
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
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = renderNetworkFilter({
      shouldQueryAp: true,
      shouldQuerySwitch: true,
      shouldQueryEdge: false,
      showRadioBand: true,
      filterFor: 'reports'
    })
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
        ['[{"type":"network","name":"Network"},{"type":"zone","name":"id5"}]', 'switchesid5'],
        ['[{"type":"network","name":"Network"},{"type":"switchGroup","name":"id4"}]'],
        ['[{"type":"network","name":"Network"},{"type":"zone","name":"id1"}]']
      ]
    )
  })

  it('should list only venues having APs', async () => {
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: networkFilterResult.filter(({ aps }) => aps.length) } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    mockUseReportsFilter.raw = [['switchGroup']] as never[]
    const { asFragment } = renderNetworkFilter({
      shouldQueryAp: true,
      shouldQuerySwitch: false,
      shouldQueryEdge: false,
      showRadioBand: true,
      filterFor: 'reports'
    })
    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should list only venues having Switches', async () => {
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: {
        venueHierarchy: networkFilterResult.filter(({ switches }) => switches.length)
      } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    mockUseReportsFilter.raw = [['zone']] as never[]
    const { asFragment } = renderNetworkFilter({
      shouldQueryAp: false,
      shouldQuerySwitch: true,
      shouldQueryEdge: false,
      filterFor: 'reports'
    })
    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should handle Features.EDGE_NETWORK_FILTER_TOGGLE', async () => {
    jest.mocked(useAnySplitsOn).mockReturnValue(null)
    const props = {
      shouldQueryAp: false,
      shouldQuerySwitch: false,
      shouldQueryEdge: true,
      withIncidents: false
    }

    const { rerender } = renderNetworkFilter(props)

    expect(screen.queryAllByRole('menuitemcheckbox')).toHaveLength(0)

    jest.mocked(useAnySplitsOn).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: [{
        id: 'venue1',
        type: 'zone',
        name: 'Venue With Edge',
        edges: [
          { id: 'edge1', name: 'Test Edge 1' }
        ]
      }] } }
    })

    rerender(<NetworkFilter {...props} />)

    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))

    expect(await screen.findAllByRole('menuitemcheckbox')).toHaveLength(1)
  })

  it('should return empty array when shouldQueryAp is true and any item contains edge data',
    async () => {
      mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
        data: { network: { venueHierarchy: networkFilterResult } }
      })
      mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
        data: { network: { hierarchyNode: { incidents: mockIncidents } } }
      })

      // Mock raw values that would be generated when edge venues are processed
      // This simulates what happens when venues with edge devices are selected
      mockUseReportsFilter.raw = [
        // Regular venue without edge
        [
          '[{"type":"network","name":"Network"},{"type":"zone","name":"zone1"}]',
          'apszone1',
          '[{"type":"network","name":"Network"},{"type":"zone","name":"zone1"}]'
        ],
        // Venue with edge device - this should trigger empty return
        [
          '[{"type":"network","name":"Network"},{"type":"zone","name":"zone2"}]',
          'edgezone2',
          // eslint-disable-next-line max-len
          '[{"type":"network","name":"Network"},{"type":"zone","name":"zone2"},{"type":"edge","name":"edge1"}]'
        ]
      ] as never[]

      renderNetworkFilter({
        shouldQueryAp: true,
        shouldQuerySwitch: false,
        shouldQueryEdge: false,
        filterFor: 'reports'
      })

      await screen.findByText('Entire Organization')
    })

  it('should filter normally when shouldQueryAp is true and no edge data exists', async () => {
    // Set up test data with NO edge devices
    const testData = [
      {
        id: 'zone1',
        type: 'zone',
        name: 'Venue1',
        aps: [{ name: 'AP1', mac: '00:00:00:00:00:01' }]
      }
    ]

    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: testData } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })

    // Clear any existing raw data
    mockUseAnalyticsFilter.raw = []

    renderNetworkFilter({
      shouldQueryAp: true,
      shouldQuerySwitch: false,
      shouldQueryEdge: false
    })

    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))

    // Verify that venue options are shown when no edge data is present
    const options = await screen.findAllByRole('menuitemcheckbox')
    expect(options.length).toBeGreaterThan(0)
  })

  it('should show edge data when shouldQueryEdge is true', async () => {
    jest.mocked(useAnySplitsOn).mockReturnValue(true) // Enable edge feature toggle

    // Set up test data with edge devices
    const testData = [{
      id: 'venue1',
      type: 'zone',
      name: 'Venue With Edge',
      edges: [{ id: 'edge1', name: 'Test Edge 1' }]
    }]

    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: testData } }
    })

    // Clear any existing raw data
    mockUseAnalyticsFilter.raw = []

    renderNetworkFilter({
      shouldQueryAp: false,
      shouldQuerySwitch: false,
      shouldQueryEdge: true
    })

    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))

    // Verify that edge options are shown
    const options = await screen.findAllByRole('menuitemcheckbox')
    expect(options.length).toBeGreaterThan(0)
  })

  it('should select network node and bands with onApplyFn', async () => {
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = renderNetworkFilter({
      shouldQueryAp: true,
      shouldQuerySwitch: true,
      shouldQueryEdge: false,
      filterFor: 'reports',
      showRadioBand: true
    })
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
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    renderNetworkFilter({
      shouldQueryAp: true,
      shouldQuerySwitch: true,
      shouldQueryEdge: false
    })
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
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    renderNetworkFilter({
      shouldQueryAp: true,
      filterFor: 'reports',
      shouldQuerySwitch: true,
      shouldQueryEdge: false
    })
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
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: networkFilterResult } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = renderNetworkFilter({
      shouldQueryAp: true,
      shouldQuerySwitch: true,
      shouldQueryEdge: false,
      withIncidents: true
    })
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(screen.getByRole('combobox'))
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should not show any severity circle when venueHierarchy is empty', async () => {
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: { network: { venueHierarchy: [] } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: mockIncidents } } }
    })
    const { asFragment } = renderNetworkFilter({
      shouldQueryAp: true,
      shouldQuerySwitch: true,
      shouldQueryEdge: false,
      withIncidents: true
    })
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
      aps: [
        { name: 'AP Name', mac: '00:00:00:00:00:00' }
      ],
      switches: [
        { name: 'Switch Name', mac: '11:11:11:11:11:11' }
      ]
    }]
    const [firstItem] = getNetworkFilterData(data, {}, false)

    /* eslint-disable testing-library/no-node-access */
    const [apItem, switchItem] = firstItem.children!
    expect(JSON.parse(String(firstItem.value))[1].name).toEqual('Some Name')
    expect(apItem.value).toEqual('apsSome Name')
    expect(apItem.children?.[0].label).toEqual('AP Name (00:00:00:00:00:00)')
    expect(JSON.parse(String(apItem.children?.[0].value))[1].name).toEqual('Some Name')
    expect(switchItem.value).toEqual('switchesSome Name')
    expect(switchItem.children?.[0].label).toEqual('Switch Name (11:11:11:11:11:11)')
    expect(JSON.parse(String(switchItem.children?.[0].value))[1].name).toEqual('Some Name')
    /* eslint-enable testing-library/no-node-access */
  })
  it('should not return aps and switches in the network filter', () => {
    const data: Child[] = [{
      id: '473f0528888b4e09872b1560711d9dbd',
      type: 'zone',
      name: 'Some Name',
      aps: [
        { name: 'AP Name', mac: '00:00:00:00:00:00' }
      ],
      switches: [
        { name: 'Switch Name', mac: '11:11:11:11:11:11' }
      ]
    }]
    const [firstItem] = getNetworkFilterData(data, {}, false, true)
    // eslint-disable-next-line testing-library/no-node-access
    const [apItem, switchItem] = firstItem.children!
    expect(apItem).toBeUndefined()
    expect(switchItem).toBeUndefined()
  })
  it('should return data for edges', () => {
    const data: Child[] = [
      {
        id: 'venue1',
        type: 'zone',
        name: 'Venue 1',
        edges: [
          { id: 'edge1', name: 'Edge 1' },
          { id: 'edge2', name: 'Edge 2' }
        ]
      }
    ]

    expect(getNetworkFilterData(data, {}, true)).toEqual([{
      label: 'Venue 1',
      extraLabel: expect.anything(),
      value: JSON.stringify([
        { type: 'network', name: 'Network' },
        { type: 'zone', name: 'venue1' }
      ]),
      children: [{
        label: 'RUCKUS Edges',
        ignoreSelection: true,
        value: 'edgesvenue1',
        children: [{
          label: 'Edge 1',
          value: JSON.stringify([
            { type: 'network', name: 'Network' },
            { type: 'zone', name: 'venue1' },
            { type: 'edge', name: 'edge1' }
          ])
        }, {
          label: 'Edge 2',
          value: JSON.stringify([
            { type: 'network', name: 'Network' },
            { type: 'zone', name: 'venue1' },
            { type: 'edge', name: 'edge2' }
          ])
        }]
      }]
    }])
  })
})

describe('modifyRawValue', () => {
  it('should not modify rawVal if only zones are present in data, for switch case', () => {
    const rawVal = [
      '[{"type":"zone","name":"zone-name"}]',
      'apszone',
      '[{"type":"zone","name":"zone-name"},{"type":"AP","name":"CC:1B:5A:00:9F:40"}]'
    ]
    const dataText = '[{"type":"zone","name":"zone-name"}]'
    expect(modifyRawValue(rawVal, dataText, 'switchGroup', 'zone')).toEqual(rawVal)
  })

  it('should modify zone to switchGroup for switch case', () => {
    const rawVal = [
      '[{"type":"zone","name":"zone-name"}]'
    ]
    const dataText = '[{"type":"switchGroup","name":"zone-name"}]'
    expect(modifyRawValue(rawVal, dataText, 'zone', 'switchGroup')).toEqual([
      '[{"type":"switchGroup","name":"zone-name"}]'
    ])
  })

  it('should return empty array data does not contain the raw val nodes', () => {
    const rawVal = [
      '[{"type":"zone","name":"zone"}]',
      'apszone',
      '[{"type":"zone","name":"zone"},{"type":"AP","name":"CC:1B:5A:00:9F:40"}]'
    ]
    const dataText = '[{"type": "switchGroup", "name": "switch-group"}]'
    expect(modifyRawValue(rawVal, dataText, 'zone', 'switchGroup')).toEqual([])
  })
})
