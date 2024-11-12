import React from 'react'

import { rest } from 'msw'

import { serviceApi }                          from '@acx-ui/rc/services'
import { WifiCallingSetting, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { act, mockServer, render, screen }     from '@acx-ui/test-utils'

import { mockWifiCallingDetail } from '../__tests__/fixtures'

import { WifiCallingSettingContext } from './NetworkControlTab'
import WifiCallingSettingTable       from './WifiCallingSettingTable'


let wifiCallingSettingList = [mockWifiCallingDetail] as WifiCallingSetting[]
const setWifiCallingSettingList = jest.fn()
const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    <WifiCallingSettingContext.Provider value={{
      wifiCallingSettingList: wifiCallingSettingList,
      setWifiCallingSettingList
    }}>
      {children}
    </WifiCallingSettingContext.Provider>
  </Provider>
}

describe('WifiCallingSettingTable', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })
  })

  it('should render wifiCallingSettingTable successfully', async () => {
    mockServer.use(
      rest.get(WifiCallingUrls.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingDetail)))
    )

    render(
      <WifiCallingSettingTable />, {
        wrapper: wrapper,
        route: {
          path: '/networks/wireless/create',
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getByRole('columnheader', {
      name: /selected profile/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /description/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /qospriority/i
    })).toBeTruthy()

    expect(await screen.findByRole('cell', {
      name: /wificsp1/i
    })).toBeVisible()

    expect(await screen.findByRole('cell', {
      name: /for test/i
    })).toBeVisible()
  })
})
