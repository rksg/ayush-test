import { Form } from 'antd'

import {
  NetworkHotspot20Settings,
  NetworkSaveData
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { Hotspot20Tab } from '.'

const mockWlanData = {
  name: 'hotspot20-test',
  type: 'hotspot20',
  venues: [],
  hotspot20Settings: {
    wifiOperator: '0b9b52ea3209466ab5c17ee73edb41bf',
    identityProviders: [
      'bad92ccf19174f0db5f9edae47ad93da',
      '599deb6758bd4f0fa702f2e1cb565102'
    ]
  } as NetworkHotspot20Settings
} as NetworkSaveData

const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

it('should render Hotspot 2.0 tab correctly', async () => {

  render(
    <Provider>
      <Form>
        <Hotspot20Tab wlanData={mockWlanData} />
      </Form>
    </Provider>,
    { route: { params } }
  )

  expect(await screen.findByText('Enable RFC 5580 (Location Data)')).toBeInTheDocument()
  expect(await screen.findByText('Accounting Interim Updates')).toBeInTheDocument()
  expect(await screen.findByText('Internet Access')).toBeInTheDocument()
  expect(await screen.findByText('Access Network Type')).toBeInTheDocument()
  expect(await screen.findByText('IPv4 Address')).toBeInTheDocument()
  expect(await screen.findByText('Connection Capabilities (11)')).toBeInTheDocument()
  expect(await screen.findByRole('button', { name: 'Add Protocol' })).toBeVisible()
})