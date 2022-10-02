import '@testing-library/jest-dom'


import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CellularNetworkSelectionEnum, CommonUrlsInfo, LteBandRegionEnum, WanConnectionEnum, WifiUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'
import { fireEvent, within }          from '@acx-ui/test-utils'

import { LteBandChannels } from './LteBandChannels'
import { CellularRadioSimSettings } from './CellularRadioSimSettings'
import { CellularOptionsForm } from './CellularOptionsForm'


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
      rest.post(WifiUrlsInfo.getAvailableLteBands.url,
        (req, res, ctx) => res(ctx.json(availableLteBandsResponse)))
    )

    const venueApModelCellularResponse = {
      'model': 'M510',
      'primarySim': {
        'lteBands': [{
          'band3G': ['B2', 'B4'],
          'band4G': ['B4'],
          'region': LteBandRegionEnum.USA_CANADA
        }, {
          'band4G': ['B3'], 
          'region': LteBandRegionEnum.DOMAIN_1
        }],
        'enabled': false,
        'apn': 'defaultapn0000',
        'roaming': true,
        'networkSelection': CellularNetworkSelectionEnum.ThreeG
      },
      'secondarySim': {
        'lteBands': [{
          'band4G': ['B3'],
          'region': LteBandRegionEnum.DOMAIN_1
        }, {
          'band3G': ['B2'],
          'region': LteBandRegionEnum.USA_CANADA
        }],
        'enabled': true,
        'apn': 'defaultapn',
        'roaming': true,
        'networkSelection': CellularNetworkSelectionEnum.LTE
      },
      'wanConnection': WanConnectionEnum.CELLULAR,
      'primaryWanRecoveryTimer': 99
    }

    mockServer.use(
      rest.post(WifiUrlsInfo.getVenueApModelCellular.url,
        (req, res, ctx) => res(ctx.json(venueApModelCellularResponse)))
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

  it('should render cellular default value successfully', async () => {
  const availableLteBandsResponse = [{
      band3G: ['B2', 'B4', 'B5', 'B7'],
      band4G: ['B2', 'B4', 'B12'],
      region: LteBandRegionEnum.JAPAN,
      countryCodes: ['JP']
    }]

    mockServer.use(
      rest.post(WifiUrlsInfo.getAvailableLteBands.url,
        (req, res, ctx) => res(ctx.json(availableLteBandsResponse)))
    )

    const venueApModelCellularResponse = {
      'model': 'M510',
      'primarySim': {
        'lteBands': [{
          'band3G': ['B2', 'B4'],
          'band4G': ['B4'],
          'region': LteBandRegionEnum.DOMAIN_1
        }, {
          'band4G': ['B3'], 
          'region': LteBandRegionEnum.DOMAIN_2
        }],
        'enabled': false,
        'apn': 'defaultapn0000',
        'roaming': true,
        'networkSelection': CellularNetworkSelectionEnum.ThreeG
      },
      'secondarySim': {
        'lteBands': [{
          'band4G': ['B3'],
          'region': LteBandRegionEnum.DOMAIN_2
        }, {
          'band3G': ['B2'],
          'region': LteBandRegionEnum.JAPAN
        }],
        'enabled': true,
        'apn': 'defaultapn',
        'roaming': true,
        'networkSelection': CellularNetworkSelectionEnum.LTE
      },
      'wanConnection': WanConnectionEnum.CELLULAR,
      'primaryWanRecoveryTimer': 99
    }

    mockServer.use(
      rest.post(WifiUrlsInfo.getVenueApModelCellular.url,
        (req, res, ctx) => res(ctx.json(venueApModelCellularResponse)))
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
