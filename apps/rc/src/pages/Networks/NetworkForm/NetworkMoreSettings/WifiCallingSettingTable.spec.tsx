import React from 'react'

import { act }  from '@testing-library/react'
import { rest } from 'msw'

import { serviceApi }                 from '@acx-ui/rc/services'
import { WifiCallingUrls }            from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import WifiCallingSettingTable from './WifiCallingSettingTable'


const wifiCallingSettingTable = [
  {
    profileName: 'AT&T',
    description: 'AT&T des',
    qosPriority: 'WIFICALLING_PRI_VOICE'
  },
  {
    profileName: 'Sprint',
    description: 'Sprint des',
    qosPriority: 'WIFICALLING_PRI_VOICE'
  },
  {
    profileName: 'Verizon',
    description: 'Verizon des',
    qosPriority: 'WIFICALLING_PRI_VOICE'
  },
  {
    profileName: 'T-Mobile',
    description: 'T-Mobile des',
    qosPriority: 'WIFICALLING_PRI_VOICE'
  }
]

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

describe('WifiCallingSettingTable', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })
  })

  it('should render wifiCallingSettingTable successfully', async () => {
    mockServer.use(rest.get(
      WifiCallingUrls.getWifiCallingList.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingSettingTable)
      )
    ))

    render(
      <WifiCallingSettingTable />, {
        wrapper: wrapper,
        route: {
          path: '/networks/create',
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
  })
})
