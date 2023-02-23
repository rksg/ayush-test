import '@testing-library/jest-dom'
import { rest } from 'msw'

import { switchApi }                       from '@acx-ui/rc/services'
import { IP_ADDRESS_TYPE, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { mockServer, render, screen }      from '@acx-ui/test-utils'

import { SwitchDetailsContext }                                                      from '../../..'
import { stackMemberStandalone, switchDetailSatckOnline, switchDetailSwitchOffline } from '../__tests__/fixtures'

import { SwitchFrontRearView } from '.'

describe('SwitchFrontRearView', () => {

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get( SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json({
          dhcpClientEnabled: true,
          dhcpServerEnabled: false,
          ipAddressType: IP_ADDRESS_TYPE.DYNAMIC
        }))),
      rest.post( SwitchUrlsInfo.getDhcpPools.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly : stack online', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          currentSwitchOperational: true,
          switchName: 'FEK3230S0DA',
          switchDetailHeader: switchDetailSatckOnline
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchFrontRearView stackMember={stackMemberStandalone} />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab'
      }
    })

    expect(await screen.findByText('ICX7150-C12P')).toBeVisible()
    expect(await screen.findByText('Active')).toBeVisible()
  })

  it('should render correctly : switch offline', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          currentSwitchOperational: false,
          switchName: 'FEK3230S0DA',
          switchDetailHeader: switchDetailSwitchOffline
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchFrontRearView stackMember={[]} />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab'
      }
    })

    expect(await screen.findByText('Rear View')).toBeVisible()
  })

})