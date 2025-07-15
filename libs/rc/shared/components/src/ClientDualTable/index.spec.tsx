import { rest } from 'msw'

import { useIsSplitOn, Features }                                                    from '@acx-ui/feature-toggle'
import { apApi, clientApi, networkApi, venueApi }                                    from '@acx-ui/rc/services'
import { ClientUrlsInfo, CommonRbacUrlsInfo, CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ClientDualTable } from './index'

describe('ClientDualTable', () => {
  const mockGetClientList = jest.fn()
  jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_RBAC_API) // mock Features.USERS
  const params = {
    tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
    venueId: '4c778ed630394b76b17bce7fe230cf9f'
  }

  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockGetClientList.mockClear()
    mockServer.use(
      rest.post(
        ClientUrlsInfo.getClients.url,
        (req, res, ctx) => {
          mockGetClientList(req.body)
          return res(ctx.json({
            totalCount: 0, page: 1, data: []
          }))
        }
      ),
      rest.post(
        CommonUrlsInfo.getHistoricalClientList.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 0, page: 1, data: []
        }))
      ),
      rest.post(
        CommonUrlsInfo.getEventListMeta.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should render list correctly', async () => {
    render(<Provider><ClientDualTable /></Provider>, {
      route: { params, path: '/t/:tenantId/users/wifi/clients' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockGetClientList).toBeCalledTimes(1))
    await screen.findByPlaceholderText('Search for connected and historical clients...')

    fireEvent.mouseEnter(screen.getByTestId('QuestionMarkCircleOutlined'))
    await screen.findByText('You can search for clients', { exact: false })
  })

  it.skip('should search correctly', async () => {
    render(<Provider><ClientDualTable /></Provider>, {
      route: { params, path: '/t/:tenantId/venues/:venueId/venue-details/clients' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const input =
      await screen.findByPlaceholderText('Search for connected and historical clients...')

    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.change(input, { target: { value: 'aa' } })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Search Results', { exact: false })).toBeVisible()
    expect(await screen.findByRole('link', { name: /0 Historical clients/i })).toBeVisible()

    fireEvent.click(await screen.findByRole('link', { name: /0 Historical clients/i }))
  })

  it('should render list correctly(clientMac from path params)', async () => {
    render(<Provider><ClientDualTable clientMac={'3C:22:FB:97:C7:EF'}/></Provider>, {
      route: {
        params: { ...params, clientMac: '3C:22:FB:97:C7:EF' },
        path: '/t/:tenantId/users/wifi/clients/search/:clientMac'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockGetClientList).toBeCalledTimes(1))
    await waitFor(() => {
      expect(mockGetClientList).toHaveBeenCalledWith(expect.objectContaining({
        defaultPageSize: 10,
        fields: [
          'modelName',
          'deviceType',
          'osType',
          'username',
          'hostname',
          'macAddress',
          'ipAddress',
          'mldMacAddress',
          'cpeMacAddress',
          'connectedTime',
          'lastUpdatedTime',
          'venueInformation',
          'apInformation',
          'networkInformation',
          'switchInformation',
          'signalStatus',
          'radioStatus',
          'trafficStatus',
          'authenticationStatus',
          'band',
          'identityId',
          'identityName',
          'identityGroupId',
          'identityGroupName'
        ],
        filters: {},
        page: 1,
        pageSize: 10,
        searchString: '3C:22:FB:97:C7:EF',
        searchTargetFields: [
          'macAddress',
          'mldMacAddress',
          'ipAddress',
          'username',
          'hostname',
          'osType',
          'networkInformation.ssid',
          'networkInformation.vni',
          'networkInformation.vlan'
        ],
        sortField: 'name',
        sortOrder: 'ASC',
        total: 0
      }))
    })
  })
})
