/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { render }                  from '@testing-library/react'
import { rest }                    from 'msw'
import { setupServer }             from 'msw/node'
import { BrowserRouter as Router } from 'react-router-dom'

import {
  CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'

import { NetworkVenuesTab } from './index'


const network = {
  type: 'aaa',
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  venues: [
    {
      venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      allApGroupsRadio: 'Both',
      isAllApGroups: true,
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      id: '7a97953dc55f4645b3cdbf1527f3d7cb'
    }
  ],
  name: '03',
  enableAuthProxy: false,
  enableAccountingProxy: false,
  id: '373377b0cb6e46ea8982b1c80aabe1fa'
}

const user = {
  COMMON:
    '{"tab-networking-devices":"switch","activity":{"showUnreadMark":true,"isFirstTime":false},"tab-events-logs":"activities","tab-venue-networks":"switch","tab-users":"wifi"}',
  WIFI: '{"network-venues":{"columns":{"name":true,"description":true,"city":true,"country":true,"networks":true,"aggregatedApStatus":true,"activated":true,"vlan":true,"aps":true,"radios":true,"scheduling":true}}}'
}

const list = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'd7b1a9a350634115a92ee7b0f11c7e75',
      name: '101',
      description: '',
      city: 'Melbourne, Victoria',
      country: 'Australia',
      latitude: '-37.8145092',
      longitude: '144.9704868',
      networks: { count: 1, names: ['03'], vlans: [1] },
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 },
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    },
    {
      id: '02e2ddbc88e1428987666d31edbc3d9a',
      name: 'My-Venue',
      description: 'My-Venue',
      city: 'New York',
      country: 'United States',
      latitude: '40.7691341',
      longitude: '-73.94297689999999',
      switchClients: 2,
      switches: 1,
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    },
    {
      id: 'd3424e21e80143c89d84f2531306b4b6',
      name: 'pingtung',
      description: '',
      city: 'Pingtung',
      country: 'Taiwan',
      latitude: '22.6747543',
      longitude: '120.4918824',
      status: '1_InSetupPhase'
    }
  ],
  subsequentQueries: [
    {
      fields: ['scheduling', 'vlan', 'aps', 'radios'],
      url: '/api/tenant/ecc2d7cf9d2342fdb31ae0e24958fcac/wifi/network/get/deep',
      httpMethod: 'POST',
      payload: ['373377b0cb6e46ea8982b1c80aabe1fa']
    },
    {
      fields: ['activated'],
      url: '/api/tenant/ecc2d7cf9d2342fdb31ae0e24958fcac/wifi/venue/network-ap-group',
      httpMethod: 'POST',
      payload: [
        {
          venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
          networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
          ssids: ['03']
        },
        {
          venueId: '02e2ddbc88e1428987666d31edbc3d9a',
          networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
          ssids: ['03']
        },
        {
          venueId: 'd3424e21e80143c89d84f2531306b4b6',
          networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
          ssids: ['03']
        }
      ]
    }
  ]
}

const server = setupServer(
  // Request handlers given to the `setupServer` call
  // are referred to as initial request handlers.
  rest.post(CommonUrlsInfo.getNetworksVenuesList.url, (req, res, ctx) => {
    return res(ctx.json({ data: list }))
  }),
  rest.post(CommonUrlsInfo.getNetwork.url, (req, res, ctx) => {
    return res(ctx.json({ data: network }))
  }),
  rest.get(CommonUrlsInfo.getAllUserSettings.url, (req, res, ctx) => {
    return res(ctx.json({ data: user }))
  })
)

describe('NetworkDetails', () => {
  it('should render correctly', async () => {
    server.use(
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url, (req, res, ctx) => {
        return res(ctx.json({ data: list }))
      }),
      rest.post(CommonUrlsInfo.getNetwork.url, (req, res, ctx) => {
        return res(ctx.json({ data: network }))
      }),
      rest.get(CommonUrlsInfo.getAllUserSettings.url, (req, res, ctx) => {
        return res(ctx.json({ data: user }))
      })
    )
    const { asFragment } = render(
      <Provider>
        <Router>
          <NetworkVenuesTab></NetworkVenuesTab>
        </Router>
      </Provider>
    )
    // await screen.findByText('101')
    expect(asFragment()).toMatchSnapshot()
  })
})
