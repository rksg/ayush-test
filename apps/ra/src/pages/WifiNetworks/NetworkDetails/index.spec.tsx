import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import NetworkDetails from '.'

jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: () => true
}))

const mockedUsedNavigate = jest.fn()
const mockedTenantLink = {
  hash: '',
  pathname: '/networks/wireless/mockNetworkId/network-details',
  search: ''
}
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: () => mockedTenantLink
}))

jest.mock('./NetworkIncidentsTab', () => ({
  NetworkIncidentsTab: () => <div data-testid='incidents'></div>
}))
jest.mock('./NetworkReportsTab', () => ({
  NetworkDetailsReportTab: () => <div data-testid='reports'></div>
}))

describe('NetworkDetails', () => {
  const params = {
    networkId: 'mockNetworkId',
    activeTab: 'reports'
  }

  it('should render correctly', async () => {
    render(<NetworkDetails/>, {
      wrapper: Provider,
      route: {
        params,
        path: '/networks/wireless/:networkId/network-details/:activeTab'
      }
    })
    expect(await screen.findByText(params.networkId)).toBeVisible()
    expect(await screen.findByText('Incidents')).toBeVisible()
    expect(await screen.findByText('Reports')).toBeVisible()
    fireEvent.click(await screen.findByRole('tab', { name: 'Incidents' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/networks/wireless/${params.networkId}/network-details/incidents`,
      hash: '',
      search: ''
    })
  })

  it('should render with reports correctly', async () => {
    render(<NetworkDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'reports'
        },
        path: '/networks/wireless/:networkId/network-details/:activeTab'
      }
    })
    expect(await screen.findByRole('tab', { name: 'Reports', selected: true })).toBeVisible()
  })

  it('should render incidents correctly', async () => {
    render(<NetworkDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'incidents'
        },
        path: '/networks/wireless/:networkId/network-details/:activeTab'
      }
    })
    expect(await screen.findByRole('tab', { name: 'Incidents', selected: true }))
      .toBeVisible()
    expect(await screen.findByTestId('incidents')).toBeVisible()
  })
})
