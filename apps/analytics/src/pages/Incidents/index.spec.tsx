import '@testing-library/jest-dom'

import { dataApiURL }                                  from '@acx-ui/analytics/services'
import { Provider }                                    from '@acx-ui/store'
import { fireEvent, mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { networkHierarchy } from '../__tests__/fixtures'

import Incidents from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  useAnalyticsFilter: () => ({
    filters: { path: [{ type: 'network', name: 'Network' }] },
    getNetworkFilter: jest
      .fn()
      .mockReturnValueOnce({
        networkFilter: { path: [{ type: 'network', name: 'Network' }] }
      })
  })
}))
jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  NetworkHistory: () => <div>Network</div>,
  IncidentBySeverity: () => <div>IncidentBySeverity</div>,
  IncidentTable: () => <div>IncidentTable</div>
}))
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
      pathname: `/t/${params.tenantId}/analytics/incidents/tab/connection`,
      hash: '',
      search: ''
    })
  })
})
