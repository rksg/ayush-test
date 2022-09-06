import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { networkApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { PoolList } from './PoolTable'

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 1,
      name: '11',
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
    },
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
  ]
}

function wrapper ({ children }: { children: React.ReactElement }) {
  return <Provider>
    <Form>
      {children}
    </Form>
  </Provider>
}

describe('Create DHCP: Pool table', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<PoolList poolData={list.data}/>, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await screen.findByText('11')
    expect(asFragment()).toMatchSnapshot()
  })


  it('Table action bar edit pool', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<PoolList poolData={list.data}/>, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('12'))
    const editButton = screen.getByRole('button', { name: 'Edit' })
    fireEvent.click(editButton)

  })

})
