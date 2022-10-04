import '@testing-library/jest-dom'

import { dataApiURL }              from '@acx-ui/analytics/services'
import { IncidentFilter }          from '@acx-ui/analytics/utils'
import { BrowserRouter as Router } from '@acx-ui/react-router-dom'
import { Provider, store }         from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  fireEvent,
  waitForElementToBeRemoved,
  mockGraphqlMutation
} from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { api } from './services'

import IncidentTableWidget from '.'

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

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filter: {}
}

const unmutedIncidents = incidentTests.filter(val => !val.isMuted)

describe('IncidentTableWidget', () => {

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [] } } }
    })
    render(<Router><Provider><IncidentTableWidget filters={filters}/></Provider></Router>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render table with valid input', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTableWidget filters={filters}/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await screen.findAllByText('P4')
    expect(screen.getAllByText('P4')).toHaveLength(unmutedIncidents.length)
  })

  it('should render empty table on undefined incidents', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: undefined } } }
    })

    render(<Provider><IncidentTableWidget filters={filters}/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await screen.findByText('No Data')
    expect(screen.getByText('No Data').textContent).toBe('No Data')
  })

  const columnHeaders = [
    { name: 'Severity', count: 2 },
    { name: 'Date', count: 1 },
    { name: 'Duration', count: 1 },
    { name: 'Description', count: 1 },
    { name: 'Category', count: 2 },
    { name: 'Client Impact', count: 1 },
    { name: 'Impacted Clients', count: 1 },
    { name: 'Scope', count: 1 }
  ]

  it('should render column header', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTableWidget filters={filters}/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
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

  it('should render column header sorting', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })
    render(<Provider><IncidentTableWidget filters={filters}/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    // reset severity
    const headerList = await screen.findAllByText(columnHeaders[0].name)
    expect(headerList.length).toBeGreaterThan(0)
    const header = headerList[headerList.length - 1]

    fireEvent.click(header)


    for (let i = 0; i < columnHeaders.length; i++) {
      const headerList = await screen.findAllByText(columnHeaders[i].name)
      expect(headerList.length).toBeGreaterThan(0)
      const header = headerList[headerList.length - 1]

      fireEvent.click(header)

      const downCaret = await screen.findAllByRole('img', { hidden: false, name: 'caret-up' })
      expect(downCaret.length).toBe(1)

      fireEvent.click(header)

      const upCaret = await screen.findAllByRole('img', { hidden: false, name: 'caret-down' })
      expect(upCaret.length).toBe(1)
      fireEvent.click(header)
    }

  })

  it('should allow for muting', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })
    render(<Provider><IncidentTableWidget filters={filters}/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    const hiddenCheckboxes = await screen.findAllByRole('radio', { hidden: true, checked: false })
    expect(hiddenCheckboxes).toHaveLength(2)

    fireEvent.click(hiddenCheckboxes[0])
    mockGraphqlMutation(dataApiURL, 'MutateIncident', {
      data: {
        toggleMute: {
          success: true,
          errorMsg: 'No Error',
          errorCode: '0'
        }
      }
    })

    fireEvent.click(await screen.findByRole('button', { name: 'Mute/Unmute' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  const hiddenColumnHeaders = [
    'Type',
    'Sub-Category'
  ]

  it('should expand hidden columns', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTableWidget filters={filters}/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
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

      const settingsButton = await screen.findByText('SettingsOutlined.svg')
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

  it('should render muted incidents & reset to default', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTableWidget filters={filters}/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    const before = await screen.findAllByRole('radio', { hidden: true, checked: false })
    expect(before).toHaveLength(2)

    const settingsButton = await screen.findByText('SettingsOutlined.svg')
    expect(settingsButton).toBeDefined()
    fireEvent.click(settingsButton)

    const showMutedIncidents = await screen.findByText('Show Muted Incidents')
    expect(showMutedIncidents).toBeDefined()
    fireEvent.click(showMutedIncidents)

    const afterShowMuted = await screen.findAllByRole('radio', { hidden: true, checked: false })
    expect(afterShowMuted).toHaveLength(3)

    fireEvent.click(settingsButton)
    const resetButton = await screen.findByText('Reset to default')
    expect(resetButton).toBeDefined()
    fireEvent.click(resetButton)

    const afterReset = await screen.findAllByRole('radio', { hidden: true, checked: false })
    expect(afterReset).toHaveLength(2)
  })

  it('should render drawer when click on description', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTableWidget filters={filters}/></Provider>,{
      route: {
        path: '/t/tenantId/analytics/incidents',
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
  it('should render drawer when click on description & show impacted clients', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTableWidget filters={filters}/></Provider>,{
      route: {
        path: '/t/tenantId/analytics/incidents',
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
    expect(await screen.findByText('Root cause:')).toBeVisible()
  })
  it('should close drawer when click on drawer close button', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTableWidget filters={filters}/></Provider>,{
      route: {
        path: '/t/tenantId/analytics/incidents',
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
    fireEvent.click(await screen.findByText('CloseSymbol.svg'))
    expect(screen.queryByText('Root cause:')).toBeNull()
  })

})


