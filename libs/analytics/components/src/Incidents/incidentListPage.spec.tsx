import { dataApiURL, Provider }             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { networkHierarchy } from '../__tests__/fixtures'

import { IncidentListPage, IncidentTabContent } from './incidentListPage'

jest.mock('../IncidentBySeverity', () => ({
  IncidentBySeverity: () => <div data-testid='IncidentBySeverity' />
}))
jest.mock('../IncidentTable', () => ({
  IncidentTable: () => <div data-testid='IncidentTable' />
}))
jest.mock('../NetworkHistory', () => ({
  NetworkHistory: () => <div data-testid='NetworkHistory' />
}))

const params = { tenantId: 'tenant-id' }

const mockQueries = () => {
  mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
    data: { network: { node: { apCount: 11, clientCount: 6, switchCount: 0 } } }
  })
  mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
    data: { network: { hierarchyNode: networkHierarchy } }
  })
  mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
    data: { network: { hierarchyNode: { incidents: [] } } }
  })
  mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
    data: { network: { hierarchyNode: { P1: 0, P2: 0, P3: 0, P4: 0 } } }
  })
  mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
    data: { network: { hierarchyNode: { timeSeries: {
      time: [], newClientCount: [], impactedClientCount: [], connectedClientCount: []
    } } } }
  })
}

describe('IncidentListPage', () => {
  beforeEach(() => mockQueries())
  it('should render page header and grid layout', async () => {
    render(<IncidentListPage/>, { wrapper: Provider, route: { params } })
    expect(await screen.findByText('Incidents')).toBeVisible()
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(await screen.findByTestId('IncidentBySeverity')).toBeVisible()
    expect(await screen.findByTestId('NetworkHistory')).toBeVisible()
    expect(await screen.findByTestId('IncidentTable')).toBeVisible()
  })
})

describe('IncidentTabContent', () => {
  beforeEach(() => mockQueries())
  it('should render correctly', async () => {
    render(<IncidentTabContent />, { wrapper: Provider, route: { params } })
    expect(await screen.findByTestId('IncidentBySeverity')).toBeVisible()
    expect(await screen.findByTestId('NetworkHistory')).toBeVisible()
    expect(await screen.findByTestId('IncidentTable')).toBeVisible()
  })
  it('should render disabled graphs', async () => {
    render(<IncidentTabContent disableGraphs />, { wrapper: Provider, route: { params } })
    expect(screen.queryByTestId('IncidentBySeverity')).toBeNull()
    expect(screen.queryByTestId('NetworkHistory')).toBeNull()
    expect(await screen.findByTestId('IncidentTable')).toBeVisible()
  })
})