import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { networkApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  fireEvent,
  within
} from '@acx-ui/test-utils'


import { PoolList } from './PoolTable'

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 1,
      name: 'test1',
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
      name: 'test2',
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

    const { asFragment } = render(<PoolList poolData={list.data}/>, {
      wrapper
    })

    await screen.findByText('test1')
    expect(asFragment()).toMatchSnapshot()
  })


  it('Table action bar edit pool', async () => {


    render(<PoolList poolData={list.data}/>, {
      wrapper
    })

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    userEvent.click(screen.getByText('test1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    userEvent.click(screen.getByText('test2'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

  })

})
