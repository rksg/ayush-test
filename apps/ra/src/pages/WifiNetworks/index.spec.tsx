import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { WiFiNetworksPage, NetworkTabsEnum } from '.'

const mockedUsedNavigate = jest.fn()
const mockedTenantLink = {
  hash: '',
  pathname: '/ai/networks',
  search: ''
}
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: () => mockedTenantLink
}))
jest.mock('./NetworksTable', () => ({
  NetworkList: () => <div>Network list content</div>
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid='report'></div>
}))

describe('Wi-Fi Networks', () => {
  it('should render wifi networks list tab', async () => {
    render(<WiFiNetworksPage tab={NetworkTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Network List')).toBeVisible()
    expect(await screen.findByText('Network list content')).toBeVisible()
    expect(await screen.findByText('Last 24 Hours')).toBeVisible()
  })
  it('should handle WLAN report tab click', async () => {
    render(<WiFiNetworksPage tab={NetworkTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('WLANS Report'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/ai/networks/wireless/reports/wlans', hash: '', search: ''
    })
  })
  it('should handle Applications report tab click', async () => {
    render(<WiFiNetworksPage tab={NetworkTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Applications Report'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/ai/networks/wireless/reports/applications', hash: '', search: ''
    })
  })
  it('should handle Wireless report tab click', async () => {
    render(<WiFiNetworksPage tab={NetworkTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Wireless Report'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/ai/networks/wireless/reports/wireless', hash: '', search: ''
    })
  })
})
