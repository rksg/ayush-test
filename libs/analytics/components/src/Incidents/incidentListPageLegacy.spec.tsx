import '@testing-library/jest-dom'

import { dataApiURL, Provider }                        from '@acx-ui/store'
import { fireEvent, mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { networkHierarchy } from '../__tests__/fixtures'

import { IncidentListPageLegacy as Incidents, IncidentTabContentLegacy } from './incidentListPageLegacy'



jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  useAnalyticsFilter: () => ({
    filters: { filter: {} }
  })
}))
jest.mock('../NetworkHistory', () => ({ NetworkHistory: () => <div>Network</div> }))
jest.mock('../IncidentBySeverity', () => ({ IncidentBySeverity: () => <div>IByS</div> }))
jest.mock('../IncidentTable', () => ({ IncidentTable: () => <div>IncidentTable</div> }))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const queryResult = {
  network: {
    node: {
      type: 'switch',
      name: 'Switch',
      model: 'm',
      firmware: '123',
      portCount: 20
    }
  }
}
describe('Incidents Page', () => {
  const params = {
    activeTab: 'overview',
    tenantId: 'tenant-id'
  }
  beforeEach(() => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', { data: queryResult })
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [] } } }
    })
  })
  it('should render page header and grid layout', async () => {
    render(
      <Provider>
        <Incidents />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Incidents')).toBeVisible()
    expect(await screen.findByText('IncidentTable')).toBeVisible()
  })
  it('should render page with Overview tab selection', async () => {
    render(
      <Provider>
        <Incidents />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Overview')).toBeVisible()
  })
  it('should render page with default tab selection when activeTab param is not set', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <Incidents />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Overview')).toBeVisible()
  })
  it('should handle tab changes', async () => {
    render(
      <Provider>
        <Incidents />
      </Provider>,
      { route: { params } }
    )
    fireEvent.click(await screen.findByText('Connection'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/analytics/incidents/tab/connection`,
      hash: '',
      search: ''
    })
  })

  describe('IncidentTabContent', () => {
    it('should render disabled graphs', async () => {
      const params = {
        tenantId: 'tenant-id'
      }
      render(
        <Provider>
          <IncidentTabContentLegacy disableGraphs />
        </Provider>,
        { route: { params } }
      )
      expect(screen.queryByText('Overview')).not.toBeInTheDocument()
      expect(screen.queryByText('Total Incidents')).not.toBeInTheDocument()
      expect(await screen.findByText('IncidentTable')).toBeVisible()
    })
  })
})