import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeDhcpUrls, EdgeUrlsInfo, getServiceRoutePath, NetworkSegmentationUrls, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                from '@acx-ui/store'
import { mockServer, render, screen }                                                                                              from '@acx-ui/test-utils'

import { mockEdgeData, mockEdgeDhcpDataList, mockNsgStatsList, mockVenueData } from '../__tests__/fixtures'

import NetworkSegmentationDetail from '.'


describe('NsgDetail', () => {
  let params: { tenantId: string, serviceId: string }
  const detailPath = '/:tenantId/' + getServiceRoutePath({
    type: ServiceType.NETWORK_SEGMENTATION,
    oper: ServiceOperation.DETAIL
  })
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))
      ),
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockNsgStatsList))
      )
    )
  })

  it('Should render detail page successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <NetworkSegmentationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await screen.findByText(/TestDhcp-1/i)
    expect(asFragment()).toMatchSnapshot()
  })

  it('Switch tab', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegmentationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await user.click(await screen.findByRole('tab', { name: /Dist. Switches/i }))
    await user.click(await screen.findByRole('tab', { name: /Access Switches/i }))
    await user.click(await screen.findByRole('tab', { name: /Assigned Segments/i }))
  })
})