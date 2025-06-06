import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { IncidentFilter }              from '@acx-ui/analytics/utils'
import { TableProps }                  from '@acx-ui/components'
import { BrowserRouter as Router }     from '@acx-ui/react-router-dom'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  fireEvent,
  waitForElementToBeRemoved,
  mockGraphqlMutation,
  within
} from '@acx-ui/test-utils'
import { RolesEnum, SwitchScopes, WifiScopes } from '@acx-ui/types'
import { getUserProfile, setUserProfile }      from '@acx-ui/user'
import { DateRange }                           from '@acx-ui/utils'

import { api, IncidentTableRow, IncidentNodeData } from './services'

import { IncidentMutedStatus, IncidentTable, downloadIncidentList, getIncidentsMutedStatus } from './index'

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  handleBlobDownloadFile: jest.fn()
}))
const incidentTests = [
  {
    severity: 0.12098536225957168,
    startTime: '2022-08-03T05:45:00.000Z',
    endTime: '2022-08-03T05:54:00.000Z',
    code: 'radius-failure',
    sliceType: 'ap',
    sliceValue: 'r710_!216',
    id: 'c5917024-fd4f-4e11-b65d-610f0251242b',
    path: [
      {
        type: 'zone',
        name: 'Vaibhav-venue'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '60:D0:2C:22:6B:90'
      }
    ],
    metadata: {},
    clientCount: 3,
    impactedClientCount: 2,
    isMuted: false,
    mutedBy: null,
    mutedAt: null
  },
  {
    severity: 0.15997624339040492,
    startTime: '2022-07-21T08:12:00.000Z',
    endTime: '2022-07-21T08:21:00.000Z',
    code: 'auth-failure',
    sliceType: 'ap',
    sliceValue: 'Unknown',
    id: '24e8e00b-2564-4ce9-8933-c153273dfe2d',
    path: [
      {
        type: 'zone',
        name: 'Venue-3-US'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '70:CA:97:3A:3A:40'
      }
    ],
    metadata: {},
    clientCount: 4,
    impactedClientCount: 2,
    isMuted: true,
    mutedBy: null,
    mutedAt: null
  },
  {
    severity: 0.12098536225957168,
    startTime: '2022-08-03T05:45:00.000Z',
    endTime: '2022-08-03T05:54:00.000Z',
    code: 'radius-failure',
    sliceType: 'ap',
    sliceValue: 'r710_!21690',
    id: 'c5917024-fd4f-4e11-b65d-610f0251242b123',
    path: [
      {
        type: 'zone',
        name: 'Vaibhav-venue'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '60:D0:2C:22:6B:90'
      }
    ],
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

const airtimeTests = [
  {
    severity: 0.75,
    startTime: '2022-08-04T05:45:00.000Z',
    endTime: '2022-08-05T05:54:00.000Z',
    code: 'p-airtime-rx-24g-high',
    sliceType: 'zone',
    sliceValue: 'SV-AX-APs',
    id: 'c5917024-fd4f-4e11-b65d-610f0251242b100',
    path: [
      {
        type: 'system',
        name: 'vsz-100'
      },
      {
        type: 'zone',
        name: 'SV-AX-APs'
      }
    ],
    metadata: {
      avgAnomalousAirtime: 59.28282026409949,
      rootCauseChecks: {
        checks: [
          { isHighDensityWifiDevices: true },
          { isAclbRaised: true },
          { isLargeMgmtFrameCount: true },
          { isHighSsidCountPerRadio: true },
          { isCRRMRaised: true },
          { isChannelFlyEnabled: true },
          { isHighLegacyWifiDevicesCount: true }
        ],
        params: {
          ssidCountPerRadioSlice: 1
        }
      }
    },
    clientCount: 0,
    impactedClientCount: 0,
    isMuted: false,
    mutedBy: null,
    mutedAt: null
  }
]

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

describe('IncidentTable', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [] } } }
    })
    render(<Router><Provider><IncidentTable filters={filters}/></Provider></Router>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render table with valid input', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await screen.findAllByText('P4')
    expect(screen.getAllByText('P4')).toHaveLength(incidentTests.length)
  })

  it('should render empty table on undefined incidents', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: undefined } } }
    })

    const { container } = render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    // jest not rendering sticky position
    // await screen.findByText('No Data')
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.ant-table-expanded-row-fixed')).toHaveLength(1)
  })

  const columnHeaders = [
    { name: 'Severity', count: 2 },
    { name: 'Date', count: 1 },
    { name: 'Duration', count: 1 },
    { name: 'Description', count: 1 },
    { name: 'Category', count: 2 },
    { name: 'Sub-Category', count: 2 },
    { name: 'Client Impact', count: 1 },
    { name: 'Impacted Clients', count: 1 },
    { name: 'Scope', count: 1 },
    { name: 'Visibility', count: 2 }
  ]

  it('should render column header', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: /loader/ }))

    for (let i = 0; i < columnHeaders.length; i++) {
      const header = columnHeaders[i]
      const currHeader = await screen.findAllByText(header.name)
      expect(currHeader).toHaveLength(header.count)
    }
  })

  it('should be able to mute incident', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })
    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    const checkboxes = await screen.findAllByRole('checkbox', {
      checked: false
    })
    expect(checkboxes).toHaveLength(4)

    fireEvent.click(checkboxes[2]) // incident with isMuted = false
    mockGraphqlMutation(dataApiURL, 'MutateIncident', {
      data: {
        incident0: {
          success: true,
          errorMsg: 'No Error',
          errorCode: '0'
        }
      }
    })

    const muteButton = await screen.findByRole('button', { name: 'Mute' })
    const unmuteButton = await screen.findByRole('button', { name: 'Unmute' })
    expect(muteButton).toBeEnabled()
    expect(unmuteButton).toBeDisabled()
  })

  it('should be able to unmute incident', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })
    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    let unselectedCheckboxes = await screen.findAllByRole('checkbox', {
      checked: false
    })
    expect(unselectedCheckboxes).toHaveLength(4)

    fireEvent.click(unselectedCheckboxes[1]) // incident with isMuted = true
    unselectedCheckboxes = await screen.findAllByRole('checkbox', {
      checked: false
    })
    expect(unselectedCheckboxes).toHaveLength(3)
    mockGraphqlMutation(dataApiURL, 'MutateIncident', {
      data: {
        incident0: {
          success: true,
          errorMsg: 'No Error',
          errorCode: '0'
        }
      }
    })

    const muteButton = await screen.findByRole('button', { name: 'Mute' })
    const unmuteButton = await screen.findByRole('button', { name: 'Unmute' })
    expect(muteButton).toBeDisabled()
    expect(unmuteButton).toBeEnabled()
    fireEvent.click(unmuteButton)
    unselectedCheckboxes = await screen.findAllByRole('checkbox', {
      checked: false
    })
    expect(unselectedCheckboxes).toHaveLength(4)
  })

  it('should be able to mute multiple incidents', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })
    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    let unselectedCheckboxes = await screen.findAllByRole('checkbox', {
      checked: false
    })
    expect(unselectedCheckboxes).toHaveLength(4)

    fireEvent.click(unselectedCheckboxes[0]) // select all incidents

    mockGraphqlMutation(dataApiURL, 'MutateIncident', {
      data: {
        incident0: {
          success: true,
          errorMsg: 'No Error',
          errorCode: '0'
        },
        incident1: {
          success: true,
          errorMsg: 'No Error',
          errorCode: '0'
        },
        incident2: {
          success: true,
          errorMsg: 'No Error',
          errorCode: '0'
        }
      }
    })

    const muteButton = await screen.findByRole('button', { name: 'Mute' })
    const unmuteButton = await screen.findByRole('button', { name: 'Unmute' })
    expect(muteButton).toBeEnabled()
    expect(unmuteButton).toBeEnabled()
    fireEvent.click(muteButton)
    unselectedCheckboxes = await screen.findAllByRole('checkbox', {
      checked: false
    })
    expect(unselectedCheckboxes).toHaveLength(4)
  })

  it('should be able to unmute multiple incidents', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })
    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    const checkboxes = await screen.findAllByRole('checkbox', {
      checked: false
    })
    expect(checkboxes).toHaveLength(4)

    fireEvent.click(checkboxes[0]) // select all incidents
    mockGraphqlMutation(dataApiURL, 'MutateIncident', {
      data: {
        incident0: {
          success: true,
          errorMsg: 'No Error',
          errorCode: '0'
        },
        incident1: {
          success: true,
          errorMsg: 'No Error',
          errorCode: '0'
        },
        incident2: {
          success: true,
          errorMsg: 'No Error',
          errorCode: '0'
        }
      }
    })

    const muteButton = await screen.findByRole('button', { name: 'Mute' })
    const unmuteButton = await screen.findByRole('button', { name: 'Unmute' })
    expect(muteButton).toBeEnabled()
    expect(unmuteButton).toBeEnabled()
    unmuteButton.click()
  })

  const hiddenColumnHeaders = [
    'Type'
  ]

  it('should expand hidden columns', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    // reset severity header
    const headerList = await screen.findAllByText(columnHeaders[0].name)
    expect(headerList.length).toBeGreaterThan(0)
    const header = headerList[headerList.length - 1]
    fireEvent.click(header)

    for (let i = 0; i < hiddenColumnHeaders.length; i++) {
      const header = hiddenColumnHeaders[i]

      const settingsButton = await screen.findByTestId('SettingsOutlined')
      expect(settingsButton).toBeTruthy()
      fireEvent.click(settingsButton)

      const allHeaderElem = await screen.findAllByText(header)
      const elems = allHeaderElem.filter(elem => elem.className.includes('setting'))
      expect(elems.length).toBeGreaterThanOrEqual(1)
      const exposeTitleCheckbox = elems[0]

      fireEvent.click(exposeTitleCheckbox)

      const headerElems = await screen.findAllByText(header)
      expect(headerElems.length).toBeGreaterThanOrEqual(1)
      const titleElems = headerElems.filter(elem => elem.className.includes('column-title'))
      expect(titleElems.length).toBeGreaterThanOrEqual(1)
      const titleElem = titleElems[0]

      fireEvent.click(titleElem)

      const downCaret = await screen.findAllByRole('img', { hidden: false, name: 'caret-up' })
      expect(downCaret.length).toBe(1)

      fireEvent.click(titleElem)

      const upCaret = await screen.findAllByRole('img', { hidden: false, name: 'caret-down' })
      expect(upCaret.length).toBe(1)
      fireEvent.click(titleElem)
    }
  })

  it('should reset columns on "Reset to default" click', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    // reset severity header
    const headerList = await screen.findAllByText(columnHeaders[0].name)
    expect(headerList.length).toBeGreaterThan(0)
    const header = headerList[headerList.length - 1]
    fireEvent.click(header)

    for (let i = 0; i < hiddenColumnHeaders.length; i++) {
      const header = hiddenColumnHeaders[i]

      const settingsButton = await screen.findByTestId('SettingsOutlined')
      expect(settingsButton).toBeTruthy()
      fireEvent.click(settingsButton)

      const allHeaderElem = await screen.findAllByText(header)
      const elems = allHeaderElem.filter(elem => elem.className.includes('setting'))
      expect(elems.length).toBeGreaterThanOrEqual(1)
      const exposeTitleCheckbox = elems[0]

      fireEvent.click(exposeTitleCheckbox)

      const headerElems = await screen.findAllByText(header)
      expect(headerElems.length).toBeGreaterThanOrEqual(1)
      const titleElems = headerElems.filter(elem => elem.className.includes('column-title'))
      expect(titleElems.length).toBeGreaterThanOrEqual(1)
    }

    const resetButton = await screen.findByRole('button', { name: 'Reset to default' })
    expect(resetButton).toBeDefined()
    fireEvent.click(resetButton)

    for (let i = 0; i < columnHeaders.length; i++) {
      const header = columnHeaders[i]
      const headerElems = await screen.findAllByText(header.name)
      expect(headerElems.length).toBeGreaterThanOrEqual(1)
    }

    const checkboxes = await screen.findAllByRole('checkbox', { checked: false })
    expect(checkboxes).toHaveLength(5) // include hidden type column checkbox
  })

  it('should render all incidents and mute | unmute buttons on select', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    const checkboxes = await screen.findAllByRole('checkbox', { checked: false })
    expect(checkboxes).toHaveLength(4)
    // check the action says mute and unmute:
    fireEvent.click(checkboxes[0])
    await screen.findByRole('button', { name: 'Mute' })
    await screen.findByRole('button', { name: 'Unmute' })
  })

  it('should not show mute buttons when role = READ_ONLY', async () => {
    const profile = getUserProfile()
    setUserProfile({ ...profile, profile: {
      ...profile.profile, roles: [RolesEnum.READ_ONLY]
    } })

    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    fireEvent.click(
      await screen.findByText(
        'RADIUS failures are unusually high in Access Point: r710_!216 (60:D0:2C:22:6B:90)'
      )
    )
    expect(screen.queryByTestId('Mute')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Unmute')).not.toBeInTheDocument()
  })

  it('should not show mute buttons when wifi-u is missing on wireless incident', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: [SwitchScopes.UPDATE]
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })
    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false
      }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    fireEvent.click(
      await screen.findByText(
        'RADIUS failures are unusually high in Access Point: r710_!216 (60:D0:2C:22:6B:90)'
      )
    )
    expect(screen.queryByTestId('Mute')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Unmute')).not.toBeInTheDocument()
  })

  it('should not show mute buttons when switch-u is missing on wired incident', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.UPDATE]
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: {
        incidents: [{ ...incidentTests[0], sliceType: 'switchId' }]
      } } }
    })
    render(<Provider><IncidentTable filters={filters}/></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false
      }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    fireEvent.click(
      await screen.findByText(
        'RADIUS failures are unusually high in Unknown: r710_!216 (60:D0:2C:22:6B:90)'
      )
    )
    expect(screen.queryByTestId('Mute')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Unmute')).not.toBeInTheDocument()
  })

  it('should render drawer when click on description', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>,{
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })
    fireEvent.click(
      await screen.findByText(
        'RADIUS failures are unusually high in Access Point: r710_!216 (60:D0:2C:22:6B:90)'
      )
    )
    expect(await screen.findByText('Root cause:')).toBeVisible()
  })
  it('should render drawer when click on airtime description', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: airtimeTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>,{
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })
    fireEvent.click(
      await screen.findByText(
        'Airtime Rx is unusually high in 2.4 GHz in Venue: SV-AX-APs'
      )
    )
    expect(await screen.findByText('Root cause:')).toBeVisible()
    expect(await screen.findByText(
      'High co-channel interference.')).toBeVisible()
  })
  it('should render drawer when click on description & show impacted clients', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>,{
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })
    fireEvent.click(
      await screen.findByText(
        'RADIUS failures are unusually high in Access Point: r710_!21690 (60:D0:2C:22:6B:90)'
      )
    )
    expect(await screen.findByText(
      // eslint-disable-next-line max-len
      'RADIUS failures are high in Access Point: r710_!21690 (60:D0:2C:22:6B:90) impacting connectivity for 66.67% of clients.')
    ).toBeVisible()
    expect(await screen.findByText('Root cause:')).toBeVisible()
  })
  it('should close drawer when click on drawer close button', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>,{
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    fireEvent.click(
      await screen.findByText(
        'RADIUS failures are unusually high in Access Point: r710_!216 (60:D0:2C:22:6B:90)'
      )
    )
    fireEvent.click(await screen.findByTestId('CloseSymbol'))
    expect(screen.queryByText('Root cause:')).toBeNull()
  })
  it('should navigate to incident details when click on details button in drawer', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTable filters={filters}/></Provider>,{
      route: {
        path: '/:tenantId/t/analytics/incidents',
        params: { tenantId: '1' }
      }
    })

    await userEvent.click(
      await screen.findByText(
        'RADIUS failures are unusually high in Access Point: r710_!216 (60:D0:2C:22:6B:90)'
      )
    )
    const drawer = await screen.findByRole('dialog')
    const button = await within(drawer).findByRole('button', { name: 'More Details' })

    await userEvent.click(button)
    expect(mockedNavigate).lastCalledWith(expect.objectContaining({
      pathname: `/1/t/analytics/incidents/${incidentTests[0].id}`
    }))
  })
})
it('should render download button', async () => {
  mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
    data: { network: { hierarchyNode: { incidents: incidentTests } } }
  })

  render(<Provider><IncidentTable filters={filters}/></Provider>,{
    route: {
      path: '/tenantId/t/analytics/incidents',
      wrapRoutes: false,
      params: {
        tenantId: '1'
      }
    }
  })
  fireEvent.click(await screen.findByTestId('DownloadOutlined'))
  expect(await screen.findByTestId('DownloadOutlined')).toBeInTheDocument()
})
describe('CSV Functions', () => {
  const data = [{
    severity: 1,
    isMuted: false,
    severityLabel: 'P1',
    endTime: '2023-08-21T05:37:30.000Z',
    children: [{
      severity: 1,
      isMuted: false,
      severityLabel: 'P3',
      endTime: '2023-08-21T05:40:30.000Z'
    }]
  }, {
    severity: 0.5,
    isMuted: true,
    severityLabel: 'P2',
    endTime: '2023-08-21T05:39:30.000Z'
  }]
  const columns: TableProps<IncidentTableRow>['columns'] = [
    {
      title: 'Severity',
      width: 80,
      dataIndex: 'severityLabel',
      key: 'severity',
      sorter: {},
      defaultSortOrder: 'descend',
      fixed: 'left',
      filterable: true
    },
    {
      title: 'Date',
      width: 80,
      dataIndex: 'endTime',
      key: 'endTime',
      sorter: {},
      defaultSortOrder: 'descend',
      fixed: 'left',
      filterable: true
    }
  ]
  const originalBlob = global.Blob
  beforeEach(() => {
    global.Blob = jest.fn(() => ({
      type: 'text/csv;charset=utf-8;',
      arrayBuffer: jest.fn()
    } as unknown as Blob))
  })
  afterEach(() => {
    global.Blob = originalBlob
  })
  it('downloadIncidentList triggers download correctly', () => {
    const downloadSpy = jest.fn()
    const anchorMock = document.createElement('a')
    jest.spyOn(document, 'createElement').mockReturnValue(anchorMock)
    anchorMock.click = downloadSpy
    downloadIncidentList(data as IncidentNodeData, columns, {
      startDate: '2023-08-22T10:19:00+08:00',
      endDate: '2023-08-23T10:19:00+08:00'
    } as IncidentFilter)
    expect(global.Blob).toHaveBeenCalledWith(
      // eslint-disable-next-line max-len
      ['"Severity","Date","Muted"\n"P1","2023-08-21T05:37:30.000Z","false"\n"P3","2023-08-21T05:40:30.000Z","false"\n"P2","2023-08-21T05:39:30.000Z","true"\n'],
      { type: 'text/csv;charset=utf-8;' }
    )
  })
})

describe('getIncidentsMutedStatus', () => {
  it('should return all when no incidents', () => {
    expect(getIncidentsMutedStatus([])).toBe(IncidentMutedStatus.All)
  })

  it('should return muted when all selected incidents has isMuted = true and isMuted = false',
    () => {
      expect(
        getIncidentsMutedStatus([
          { id: '1', code: '', severityLabel: '', isMuted: true },
          { id: '2', code: '', severityLabel: '', isMuted: false }
        ])
      ).toBe(IncidentMutedStatus.All)
    }
  )

  it('should return muted when all selected incidents isMuted = true', () => {
    expect(
      getIncidentsMutedStatus([
        { id: '1', code: '', severityLabel: '', isMuted: true },
        { id: '2', code: '', severityLabel: '', isMuted: true }
      ])
    ).toBe(IncidentMutedStatus.Muted)
  })

  it('should return muted when all selected incidents isMuted = false', () => {
    expect(
      getIncidentsMutedStatus([
        { id: '1', code: '', severityLabel: '', isMuted: false },
        { id: '2', code: '', severityLabel: '', isMuted: false }
      ])
    ).toBe(IncidentMutedStatus.Unmuted)
  })
})