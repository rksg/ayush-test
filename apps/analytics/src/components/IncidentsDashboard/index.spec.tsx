import '@testing-library/jest-dom'
import { dataApiURL }      from '@acx-ui/analytics/services'
import { IncidentFilter }  from '@acx-ui/analytics/utils'
import { Provider, store } from '@acx-ui/store'
import {
  cleanup,
  mockAutoSizer,
  mockGraphqlQuery,
  render,
  screen
} from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { expectedIncidentDashboardData } from './__tests__/fixtures'
import { api }                           from './services'

import IncidentsDashboardWidget, {
  IncidentSeverityWidget
} from './index'

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
}

describe('IncidentDashboard helper widgets', () => {

  it('IncidentSeverityWidget should match data', async () => {
    render(<Provider>
      <IncidentSeverityWidget
        severityKey='P1'
        impactedClients={10}
        incidentsCount={20}
      />
    </Provider>)

    const severityKey = await screen.findByText('Incident P1')
    expect(severityKey).toBeTruthy()
    const incidentsCount = await screen.findByText('20')
    expect(incidentsCount).toBeTruthy()
    const impactedClients = await screen.findByText('10 clients impacted')
    expect(impactedClients).toBeTruthy()
  })

  it('IncidentSeverityWidget should match 0 on undefined', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: { network: { hierarchyNode: expectedIncidentDashboardData } }
    })

    render(<Provider>
      <IncidentSeverityWidget
        severityKey='P2'
      />
    </Provider>)

    const severityKey = await screen.findByText('Incident P2')
    expect(severityKey).toBeTruthy()
    const incidentsCount = await screen.findByText('0')
    expect(incidentsCount).toBeTruthy()
    const impactedClients = await screen.findByText('0 clients impacted')
    expect(impactedClients).toBeTruthy()
  })
})

describe('IncidentDashboard', () => {
  mockAutoSizer()

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  afterEach(() => cleanup())

  const mockComponentHelper = () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: { network: { hierarchyNode: expectedIncidentDashboardData } }
    })

    render(<Provider><IncidentsDashboardWidget filters={filters} /></Provider>)
  }

  it('should render no data', () => {
    mockComponentHelper()
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })
  it('should render loader', () => {
    mockComponentHelper()
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should match p1 incidents', async () => {
    mockComponentHelper()
    const p1Incidents = await screen.findByText('1')
    expect(p1Incidents.textContent).toMatch('1')

    const p1Clients = await screen.findByText('2 clients impacted')
    expect(p1Clients.textContent).toMatch('2 clients impacted')
  })

  it('should match p2 incidents', async () => {
    mockComponentHelper()
    const p2Incidents = await screen.findByText('3')
    expect(p2Incidents.textContent).toMatch('3')

    const p2Clients = await screen.findByText('4 clients impacted')
    expect(p2Clients.textContent).toMatch('4 clients impacted')
  })

  it('should match p3 incidents', async () => {
    mockComponentHelper()
    const p3Incidents = await screen.findByText('5')
    expect(p3Incidents.textContent).toMatch('5')

    const p3Clients = await screen.findByText('6 clients impacted')
    expect(p3Clients.textContent).toMatch('6 clients impacted')
  })

  it('should match p4 incidents', async () => {
    mockComponentHelper()
    const p4Incidents = await screen.findByText('7')
    expect(p4Incidents.textContent).toMatch('7')

    const p4Clients = await screen.findByText('8 clients impacted')
    expect(p4Clients.textContent).toMatch('8 clients impacted')
  })

  it('should match connection total', async () => {
    mockComponentHelper()
    const {
      connectionP1,
      connectionP2,
      connectionP3,
      connectionP4
    } = expectedIncidentDashboardData
    const total = connectionP1 + connectionP2 + connectionP3 + connectionP4

    const totalElem = await screen.findByText(total.toString())
    expect(totalElem.textContent).toMatch(total.toString())

    const connectionElem = await screen.findByText('Connection')
    expect(connectionElem).toBeTruthy()
  })

  it('should match performance total', async () => {
    mockComponentHelper()
    const {
      performanceP1,
      performanceP2,
      performanceP3,
      performanceP4
    } = expectedIncidentDashboardData
    const total = performanceP1 + performanceP2 + performanceP3 + performanceP4

    const totalElem = await screen.findByText(total.toString())
    expect(totalElem.textContent).toMatch(total.toString())

    const performanceElem = await screen.findByText('Performance')
    expect(performanceElem).toBeTruthy()
  })

  it('should match infrastructure total', async () => {
    mockComponentHelper()
    const {
      infrastructureP1,
      infrastructureP2,
      infrastructureP3,
      infrastructureP4
    } = expectedIncidentDashboardData
    const total = infrastructureP1 + infrastructureP2 + infrastructureP3 + infrastructureP4

    const totalElem = await screen.findByText(total.toString())
    expect(totalElem.textContent).toMatch(total.toString())

    const connectionElem = await screen.findByText('Infrastructure')
    expect(connectionElem).toBeTruthy()
  })
})