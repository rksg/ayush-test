import '@testing-library/jest-dom'
import { dataApiURL }                                  from '@acx-ui/analytics/services'
import { Provider }                                    from '@acx-ui/store'
import { render, screen, mockGraphqlQuery, fireEvent } from '@acx-ui/test-utils'

import Incidents from '.'

// jest.mock('../../components/Header', () => () => <div>Incidents</div>)
jest.mock('../../components/NetworkHistory', () => () => <div>Network</div>)
jest.mock('../../components/IncidentBySeverity', () => () => <div>bar chart</div>)
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
  beforeEach(() => mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', { data: queryResult }))
  it('should render page header and grid layout', async () => {
    render(
      <Provider>
        <Incidents />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Incidents')).toBeVisible()
    expect(await screen.findByText('table')).toBeVisible()
  })
  it('should render page with default tab selection', async () => {
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
