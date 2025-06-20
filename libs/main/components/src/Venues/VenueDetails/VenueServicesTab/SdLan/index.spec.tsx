import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, EdgeSdLanUrls, EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import { Provider }                                         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockNetworkSaveData, mockDeepNetworkList, mockedEdgeSdLan } from './__tests__/fixtures'

import EdgeSdLan from '.'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures
const mockedEditFn = jest.fn()
const mockedGetNetworkDeepList = jest.fn()

const services = require('@acx-ui/rc/services')

jest.mock('../SdLanP2', () => ({
  __esModule: true,
  default: () => <div data-testid='rc-EdgeSdLanP2'/>
}))
jest.mock('../MvSdLan', () => ({
  __esModule: true,
  default: () => <div data-testid='rc-MvSdLan'/>
}))
describe('Venue Edge SD-LAN Service', () => {
  let params: { tenantId: string, venueId: string }

  beforeEach(() => {
    params = {
      tenantId: 't-tenant',
      venueId: 't-venue'
    }

    mockedEditFn.mockReset()
    mockedGetNetworkDeepList.mockReset()

    services.useVenueNetworkActivationsDataListQuery = jest.fn().mockImplementation(() => {
      mockedGetNetworkDeepList()
      return {
        networkList: mockDeepNetworkList.response,
        isLoading: false,
        isFetching: false
      }
    })

    mockServer.use(
      rest.patch(
        EdgeSdLanUrls.updateEdgeSdLanPartial.url,
        (req, res, ctx) => {
          mockedEditFn(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (_, res, ctx) => res(ctx.json(mockNetworkSaveData))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <EdgeSdLan data={mockedEdgeSdLan} />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetNetworkDeepList).toBeCalled()
    })
    // display config data
    expect(await screen.findByRole('link', { name: 'mocked_SD-LAN_1' })).toBeVisible()
    expect(await screen.findByRole('link', { name: 'mocked-Venue-1' })).toBeVisible()
    expect(await screen.findByRole('link', { name: 'mocked-vSE-b490' })).toBeVisible()
    expect(await screen.findByRole('link', { name: 'mockedTunnel' })).toBeVisible()

    const networks = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(networks.length).toBe(3)
    const network1 = screen.getByRole('row', { name: /MockedNetwork 1/i })
    expect(within(network1).getByRole('switch')).toBeChecked()
    const network2 = screen.getByRole('row', { name: /MockedNetwork 2/i })
    expect(within(network2).getByRole('switch')).not.toBeChecked()
    expect(within(network2).getByRole('switch')).not.toBeDisabled()
    expect(screen.queryByTestId('rc-EdgeSdLanP2')).toBeNull()
  })

  it('should correctly deactivate network', async () => {
    render(
      <Provider>
        <EdgeSdLan data={mockedEdgeSdLan} />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetNetworkDeepList).toBeCalled()
    })

    await screen.findAllByRole('row', { name: /MockedNetwork/i })
    const network1 = await screen.findByRole('row', { name: /MockedNetwork 1/i })
    const switchBtn = within(network1).getByRole('switch')
    expect(switchBtn).toBeChecked()
    await userEvent.click(switchBtn)
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        networkIds: ['network_3']
      })
    })
  })
  it('should be able to activate network', async () => {
    render(
      <Provider>
        <EdgeSdLan data={mockedEdgeSdLan} />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetNetworkDeepList).toBeCalled()
    })

    await screen.findAllByRole('row', { name: /MockedNetwork/i })
    const network2 = await screen.findByRole('row', { name: /MockedNetwork 2/i })
    const switchBtn = within(network2).getByRole('switch')
    expect(switchBtn).not.toBeChecked()
    await userEvent.click(switchBtn)
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        networkIds: ['network_1', 'network_3', 'network_2']
      })
    })
  })
  describe('P2 FF enabled', () => {
    beforeEach(() => {
      // mock SDLAN HA(i,e p2) enabled
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_SD_LAN_HA_TOGGLE)
    })

    it('should display P2 data', async () => {
      const mockedEdgeSdLanP2 = mockedSdLanDataListP2[0]
      render(
        <Provider>
          <EdgeSdLan data={mockedEdgeSdLanP2} />
        </Provider>, {
          route: { params }
        })

      // display EdgeSdLanP2 layout
      expect(await screen.findByTestId('rc-EdgeSdLanP2')).toBeVisible()
    })
  })
})
