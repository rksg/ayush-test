import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeSdLanUrls } from '@acx-ui/rc/utils'
import { Provider }                      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockNetworkSaveData, mockDeepNetworkList, mockedEdgeSdLan } from './__tests__/fixtures'

import EdgeSdLan from '.'

const mockedEditFn = jest.fn()
const mockedGetNetworkDeepList = jest.fn()

const services = require('@acx-ui/rc/services')

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
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => {
          mockedGetNetworkDeepList()
          return res(ctx.json(mockDeepNetworkList))
        }
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
})
