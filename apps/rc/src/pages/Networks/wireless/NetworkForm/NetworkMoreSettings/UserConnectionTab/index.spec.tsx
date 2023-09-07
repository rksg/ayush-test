import { Form } from 'antd'

import { GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { render, screen }                                         from '@acx-ui/test-utils'

import NetworkFormContext from '../../NetworkFormContext'

import { UserConnectionTab } from '.'

const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
describe('UserConnectionTab', () => {
  it('should rander correctly', async () => {
    const network = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.HostApproval,
        maxDevices: 1
      }
    } as NetworkSaveData

    render(
      <Provider>
        <NetworkFormContext.Provider value={{ data: network }} >
          <Form>
            <UserConnectionTab />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    // eslint-disable-next-line max-len
    const numberElm = await screen.findByRole('spinbutton', { name: 'Max number of devices per credentials' })
    expect(numberElm).toBeVisible()
  })

  it('should hide the max number of devices with the ClickThrough type', async () => {
    const network = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.ClickThrough
      }
    } as NetworkSaveData

    render(
      <Provider>
        <NetworkFormContext.Provider value={{ data: network }} >
          <Form>
            <UserConnectionTab />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    // eslint-disable-next-line max-len
    const numberElm = screen.queryByRole('spinbutton', { name: 'Max number of devices per credentials' })
    expect(numberElm).toBeNull()
  })

})