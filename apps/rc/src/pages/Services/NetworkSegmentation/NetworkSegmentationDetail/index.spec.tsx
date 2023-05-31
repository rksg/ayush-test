import { rest } from 'msw'

import { getServiceRoutePath, NetworkSegmentationUrls, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                                                    from '@acx-ui/store'
import { mockServer, render, screen }                                                  from '@acx-ui/test-utils'

import { mockNsgStatsList } from '../__tests__/fixtures'

import NetworkSegmentationDetail from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  NetworkSegmentationServiceInfo: () => <div data-testid='NetworkSegmentationServiceInfo' />,
  NetworkSegmentationDetailTableGroup: () =>
    <div data-testid='NetworkSegmentationDetailTableGroup' />
}))

describe('NsgDetail', () => {
  let params: { tenantId: string, serviceId: string }
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({
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
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockNsgStatsList))
      )
    )
  })

  it('Should render detail page successfully', async () => {
    render(
      <Provider>
        <NetworkSegmentationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    expect(await screen.findByText('nsg1')).toBeVisible()
    expect(await screen.findByTestId('NetworkSegmentationServiceInfo')).toBeVisible()
    expect(await screen.findByTestId('NetworkSegmentationDetailTableGroup')).toBeVisible()
  })

})
