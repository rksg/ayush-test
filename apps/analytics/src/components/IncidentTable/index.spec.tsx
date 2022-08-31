import '@testing-library/jest-dom'

import { dataApiURL }              from '@acx-ui/analytics/services'
import { IncidentFilter }          from '@acx-ui/analytics/utils'
import { BrowserRouter as Router } from '@acx-ui/react-router-dom'
import { Provider, store }         from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  act,
  fireEvent,
  waitForElementToBeRemoved,
  cleanup
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
  }
]

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
}
describe('IncidentTableWidget', () => {

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  afterEach(() => cleanup())

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
    expect(screen.getAllByText('P4')).toHaveLength(incidentTests.length)
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
    'Severity',
    'Date',
    'Duration',
    'Description',
    'Category',
    'Client Impact',
    'Impacted Clients',
    'Scope'
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
      await screen.findByText(header)
      expect(screen.getByText(header).textContent).toMatch(header)
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

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const priorityHeader = columnHeaders[0]
    const elem = await screen.findByText(priorityHeader)
    const caretDown = await screen.findAllByRole('img', { name: 'caret-down', hidden: false })
    expect(caretDown).toHaveLength(1)

    fireEvent.click(elem)
    fireEvent.click(elem)
    const caretUp = await screen.findAllByRole('img', { name: 'caret-up', hidden: false })
    expect(caretUp).toHaveLength(1)

    fireEvent.click(elem)

    for (let i = 1; i < columnHeaders.length; i++) {
      const header = columnHeaders[i]
      const elem = await screen.findByText(header)

      fireEvent.click(elem)
      const caretUp = await screen.findAllByRole('img', { name: 'caret-up', hidden: false })
      expect(caretUp).toHaveLength(1)

      fireEvent.click(elem)
      const caretDown = await screen.findAllByRole('img', { name: 'caret-down', hidden: false })
      expect(caretDown).toHaveLength(2)

      fireEvent.click(elem)
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

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const hiddenCheckboxes =
      await screen.findAllByRole('radio', { hidden: true, checked: false })

    expect(hiddenCheckboxes).toHaveLength(1)

    fireEvent.click(await screen.findByRole('button', { name: /Mute/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    // add test case for muting
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

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: /loader/ }))

    for (let i = 0; i < hiddenColumnHeaders.length; i++) {
      const header = hiddenColumnHeaders[i]

      const settingsButton = await screen.findByText('SettingsOutlined.svg')
      expect(settingsButton).toBeTruthy()
      fireEvent.click(settingsButton)

      const settingsElem = await screen.findByText(header)
      expect(settingsElem).toBeTruthy()
      fireEvent.click(settingsElem)

      const elems = await screen.findAllByText(header)
      expect(elems).toHaveLength(2)
      const titleElem = elems[0]

      act(() => titleElem.click())
      expect(await screen.findAllByRole('img', { hidden: false, name: 'caret-up' }))
        .toHaveLength(1)

      act(() => titleElem.click())
      expect(await screen.findAllByRole('img', { hidden: false, name: 'caret-down' }))
        .toHaveLength(2)

      act(() => titleElem.click())
    }

  })

})
