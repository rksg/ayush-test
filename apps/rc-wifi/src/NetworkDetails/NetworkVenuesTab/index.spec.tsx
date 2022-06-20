/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                                        from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

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

const user = { WIFI: '{"network-venues":{"columns":{"name":true,"description":true,"city":true,"country":true,"networks":true,"aggregatedApStatus":true,"activated":true,"vlan":true,"aps":true,"radios":true,"scheduling":true}}}',COMMON: '{"tab-networking-devices":"wifi","activity":{"showUnreadMark":true,"isFirstTime":false},"tab-events-logs":"activities","tab-venue-networks":"switch","tab-users":"switch","report-time-active-product":"SWITCH","tab-venue-clients":"wifi"}',SWITCH: '{"switches-list":{"columns-customization":{"activeSerial":"171px"}}}' }

const list = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'd7b1a9a350634115a92ee7b0f11c7e75',
      name: 'network-venue-1',
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
describe('NetworkVenuesTab', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    })
  })
 
  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }

    const { asFragment } = render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('network-venue-1')
    expect(asFragment()).toMatchSnapshot()
  })
})
