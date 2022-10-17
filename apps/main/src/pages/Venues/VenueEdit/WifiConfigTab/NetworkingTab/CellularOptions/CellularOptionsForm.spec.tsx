import '@testing-library/jest-dom'


import { Form } from 'antd'
import { rest } from 'msw'

import { CellularNetworkSelectionEnum, CommonUrlsInfo, LteBandRegionEnum, WanConnectionEnum, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                         from '@acx-ui/store'
import { mockServer, render }                                                                               from '@acx-ui/test-utils'

import {
  venueSetting
} from '../../../../__tests__/fixtures'

import { CellularOptionsForm } from './CellularOptionsForm'

const venueApModelCellularResponse = {
  model: 'M510',
  primarySim: {
    lteBands: [{
      band3G: ['B2', 'B4'],
      band4G: ['B4'],
      region: LteBandRegionEnum.USA_CANADA
    }, {
      band4G: ['B3'],
      region: LteBandRegionEnum.DOMAIN_1
    }],
    enabled: false,
    apn: 'defaultapn0000',
    roaming: true,
    networkSelection: CellularNetworkSelectionEnum.ThreeG
  },
  secondarySim: {
    lteBands: [{
      band4G: ['B3'],
      region: LteBandRegionEnum.DOMAIN_1
    }, {
      band3G: ['B2'],
      region: LteBandRegionEnum.USA_CANADA
    }],
    enabled: true,
    apn: 'defaultapn',
    roaming: true,
    networkSelection: CellularNetworkSelectionEnum.LTE
  },
  wanConnection: WanConnectionEnum.CELLULAR,
  primaryWanRecoveryTimer: 99
}

describe('CellularOptionsForm', () => {
  const params = { venueId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should render Cellular options form successfully', async () => {
    const availableLteBandsResponse = [{
      band3G: ['B2', 'B4', 'B5'],
      band4G: ['B2', 'B4', 'B12'],
      region: LteBandRegionEnum.USA_CANADA,
      countryCodes: ['US', 'CA']
    }]

    mockServer.use(
      rest.get(WifiUrlsInfo.getAvailableLteBands.url,
        (_, res, ctx) => res(ctx.json(availableLteBandsResponse))),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.get(WifiUrlsInfo.getVenueApModelCellular.url,
        (_, res, ctx) => res(ctx.json(venueApModelCellularResponse)))
    )

    const { asFragment } = render(
      <Provider>
        <Form>
          <CellularOptionsForm/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })


})
