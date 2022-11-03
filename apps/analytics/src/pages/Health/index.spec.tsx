import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { Provider, store }     from '@acx-ui/store'
import {
  fireEvent,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { header, networkHierarchy } from '../__tests__/fixtures'

import HealthPage from '.'

const mockedUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate
}))
jest.mock('./ConnectedClientsOverTime', () => () => <div>Summary TimeSeries</div>)
jest.mock('./Kpi', () => () => <div>Kpi Section</div>)

jest.mock('./SummaryBoxes', () => ({
  SummaryBoxes: () => <div data-testid='Summary Boxes' />
}))

describe('HealthPage', () => {
  beforeEach(() => {
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', { data: header.queryResult })
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [] } } }
    })
  })
  const params = { activeTab: 'overview', tenantId: 'tenant-id' }
  it('should render page header and grid layout', async () => {
    render(<Provider><HealthPage /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    expect(screen.getByText('Health')).toBeVisible()
    expect(screen.getByTestId('Summary Boxes')).toBeVisible()
    expect(screen.getByText('Summary TimeSeries')).toBeVisible()
    expect(screen.getByText('Overview')).toBeVisible()
    expect(screen.getByText('Customized SLA Threshold')).toBeVisible()
    expect(screen.getByText('Kpi Section')).toBeVisible()
  })
  it('should render default tab when activeTab param is not set', async () => {
    const params = { tenantId: 'tenant-id' }
    render(<Provider><HealthPage /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    expect(screen.getByText('Overview')).toBeVisible()
  })
  it('should render other tab', async () => {
    const params = { activeTab: 'connection', tenantId: 'tenant-id' }
    render(<Provider><HealthPage /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    expect(screen.getByText('Connection')).toBeVisible()
  })
  it('should handle tab changes', async () => {
    render(<Provider><HealthPage /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    fireEvent.click(screen.getByText('Connection'))
    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/analytics/health/tab/connection`,
      hash: '',
      search: ''
    })
  })
})
