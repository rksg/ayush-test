import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { networkApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { PoolDetail } from './PoolDetail'

const data =
    {
      id: 2,
      name: '12',
      allowWired: false,
      ip: '1.1.1.1',
      mask: '255.0.0.0',
      primaryDNS: '',
      secondaryDNS: '',
      dhcpOptions: [],
      excludedRangeStart: '',
      excludedRangeEnd: '',
      leaseTime: 24,
      vlan: 300
    }

function wrapper ({ children }: { children: React.ReactElement }) {
  return <Provider>
    <Form>
      {children}
    </Form>
  </Provider>
}

describe('Create DHCP: Pool detail', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(data))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<PoolDetail/>, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await screen.findByText('Add DHCP Pool')
    expect(asFragment()).toMatchSnapshot()
  })
})
