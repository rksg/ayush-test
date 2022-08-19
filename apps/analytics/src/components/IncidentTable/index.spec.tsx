import '@testing-library/jest-dom'

import { dataApiURL }                                                    from '@acx-ui/analytics/services'
import { Provider, store }                                               from '@acx-ui/store'
import { mockGraphqlQuery, mockAutoSizer, render, screen, cleanup, act } from '@acx-ui/test-utils'

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

describe('IncidentTableWidget', () => {
  mockAutoSizer()

  beforeEach(() => 
    store.dispatch(api.util.resetApiState())
  )

  afterEach(() => cleanup())

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [] } } }
    })
    render(<Provider><IncidentTableWidget/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render table with valid input', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })

    render(<Provider><IncidentTableWidget/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false
      }
    })
    
    await screen.findAllByText('P4')
    expect(screen.getAllByText('P4')).toHaveLength(incidentTests.length)
  })

  it('should render empty table on undefined incidents', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: undefined } } }
    })

    render(<Provider><IncidentTableWidget/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false
      }
    })
    
    await screen.findByText('No Data')
    expect(screen.getByText('No Data').textContent).toBe('No Data')
  })

  it('should render error on undefined data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: undefined,
      error: new Error('undefined data!')
    })

    render(<Provider><IncidentTableWidget/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false
      }
    })

    await screen.findByText('Something went wrong.')
    expect(screen.getByText('Something went wrong.').textContent).toBe('Something went wrong.')
    
  })

  const columnHeaders = [
    'Severity',
    'Date',
    'Duration',
    'Description',
    'Category',
    'Client Impact',
    'Impacted Clients',
    'Scope',
    'Type'
  ]

  it.each(columnHeaders)('should render column header: "%s"', async (header) => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })
    render(<Provider><IncidentTableWidget/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })
    await screen.findByText(header)
    expect(screen.getByText(header).textContent).toBe(header)
  })

  it.each(columnHeaders)('should render column header sorting: "%s"', async (header) => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })
    render(<Provider><IncidentTableWidget/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })
    const elem = await screen.findByText(header)
    act(() => elem.click())
    await screen.findByRole('img', { hidden: true, name: 'caret-up' })
    expect(screen.getByRole('img', { hidden: true, name: 'caret-up' })).toBeTruthy()

    act(() => elem.click())
    await screen.findByRole('img', { hidden: true, name: 'caret-down' })
    expect(screen.getByRole('img', { hidden: true, name: 'caret-down' })).toBeTruthy()
  })

  it('should allow for muting',async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTests } } }
    })
    render(<Provider><IncidentTableWidget/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false,
        params: {
          tenantId: '1'
        }
      }
    })

    const rowElems = await screen.findAllByText('P4')
    expect(rowElems).toHaveLength(incidentTests.length)

    act(() => rowElems[0].click())
    await screen.findByText('2 selected')
    expect(screen.getByText('2 selected').textContent).toBe('2 selected')

    const muteButton = await screen.findByText('Mute')
    act(() => muteButton.click())
    // update to include actual muting call 
  })
})
