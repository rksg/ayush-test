import '@testing-library/jest-dom'


import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CellularNetworkSelectionEnum, CommonUrlsInfo, LteBandRegionEnum, WanConnectionEnum, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                         from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor, within }                                                            from '@acx-ui/test-utils'

import { EditContext, VenueEditContext } from '../../..'
import {
  venueSetting
} from '../../../../__tests__/fixtures'

import { CellularOptionsForm } from './CellularOptionsForm'
import { venueApi } from '@acx-ui/rc/services'

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

const availableLteBandsResponse = [{
  band3G: ['B2', 'B4', 'B5'],
  band4G: ['B2', 'B4', 'B12'],
  region: LteBandRegionEnum.USA_CANADA,
  countryCodes: ['US', 'CA']
}]

describe('CellularOptionsForm', () => {
  const params = { venueId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  let editContextData = {} as EditContext
  const setEditContextData = jest.fn()

  const mockedUsedNavigate = jest.fn()
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate
  }))
  
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiUrlsInfo.getAvailableLteBands.url,
        (_, res, ctx) => res(ctx.json(availableLteBandsResponse))),
      rest.get(CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.get(WifiUrlsInfo.getVenueApModelCellular.url,
        (_, res, ctx) => res(ctx.json(venueApModelCellularResponse))),
      rest.put(WifiUrlsInfo.updateVenueCellularSettings.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  it('should render Cellular options form successfully', async () => {

    mockServer.use(
      rest.get(WifiUrlsInfo.getAvailableLteBands.url,
        (_, res, ctx) => res(ctx.json(availableLteBandsResponse))),
      rest.get(CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.get(WifiUrlsInfo.getVenueApModelCellular.url,
        (_, res, ctx) => res(ctx.json(venueApModelCellularResponse))),
      rest.put(WifiUrlsInfo.updateVenueCellularSettings.url,
        (_, res, ctx) => res(ctx.json({})))
    )

    const { asFragment } = render(
      <Provider>
        <Form>
          <CellularOptionsForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    screen.getByText(/1 primary sim/i)
    const view = screen.getByTestId('primarySim');
    await waitFor(() => within(view).getByText(/show bands for other countries/i))
    expect(asFragment()).toMatchSnapshot()
  })


  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi',
      activeSubTab: 'networking'
    }
    render(
      <Provider>
        <VenueEditContext.Provider value={{ editContextData, setEditContextData }}>
          <CellularOptionsForm />
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    const wanConnection = screen.getByText(/ethernet \(primary\) with cellular failover/i)
    fireEvent.click(wanConnection)

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })
})
