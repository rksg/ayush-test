import '@testing-library/jest-dom'


import { Form } from 'antd'

import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { NetworkOverviewTab } from './index'


jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  ConnectedClientsOverTime: () => <div></div>,
  NetworkHistory: () => <div></div>,
  TopApplicationsByTraffic: () => <div></div>,
  TrafficByVolume: () => <div></div>,
  VenueHealth: () => <div></div>
}))
jest.mock('../services', () => ({
  extractSSIDFilter: () => [],
  useGetNetwork: () => ({})
}))
describe('NetworkOverviewTab', () => {
  it('should render network incidents tab successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <NetworkOverviewTab />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

})

