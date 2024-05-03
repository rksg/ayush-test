import { Form } from 'antd'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { Hotspot20Tab } from '.'

const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

it('should render Hotspot 2.0 tab correctly', async () => {

  render(
    <Provider>
      <Form>
        <Hotspot20Tab />
      </Form>
    </Provider>,
    { route: { params } }
  )

  expect(await screen.findByText('Accounting Interim Updates')).toBeInTheDocument()
  expect(await screen.findByText('Internet Access')).toBeInTheDocument()
  expect(await screen.findByText('Access Network Type')).toBeInTheDocument()
  expect(await screen.findByText('Private')).toBeInTheDocument()
  expect(await screen.findByText('IPv4 Address')).toBeInTheDocument()
  expect(await screen.findByText('Single NATed private address')).toBeInTheDocument()
  expect(await screen.findByText('Connection Capabilities (11)')).toBeInTheDocument()
  expect(await screen.findByRole('button', { name: 'Add Protocol' })).toBeVisible()
})