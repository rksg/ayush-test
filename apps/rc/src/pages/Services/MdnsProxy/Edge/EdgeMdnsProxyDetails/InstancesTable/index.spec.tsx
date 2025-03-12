import { rest } from 'msw'

import {
  EdgeMdnsFixtures,
  EdgeMdnsProxyUrls,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { InstancesTable } from './'

const { mockEdgeMdnsViewDataList, mockEdgeMdnsStatsList } = EdgeMdnsFixtures

describe('Edge mDNS InstancesTable', () => {
  const params = {
    tenantId: 'mock-tenant_id',
    serviceId: 'mock-service_id'
  }

  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY, oper: ServiceOperation.DETAIL })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (_, res, ctx) => {
          return res(ctx.json({
            data: mockEdgeMdnsViewDataList
          }))
        }),
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyStatsList.url,
        (_, res, ctx) => {
          return res(ctx.json({
            data: mockEdgeMdnsStatsList
          }))
        })
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <InstancesTable serviceId='mock-service_id' />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Instances (2)')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(screen.getByRole('row', { name: 'Edge Cluster 1 Mock Venue 1 928 | 370 B 344 | 468 B 190 778 2' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(screen.getByRole('row', { name: 'Edge Cluster 3 Mock Venue 3 0 | 0 B 0 | 0 B 0 0 0' })).toBeVisible()
  })

  it('should render correctly when no instances', async () => {
    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (_, res, ctx) => {
          return res(ctx.json({
            data: []
          }))
        })
    )

    render(
      <Provider>
        <InstancesTable serviceId='mock-service_id'/>
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    expect(await screen.findByText('Instances (0)')).toBeVisible()
  })

  it('should render correctly when serviceId is undefined', async () => {
    const mockeReq = jest.fn()
    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (_, res, ctx) => {
          mockeReq()
          return res(ctx.json({
            data: []
          }))
        })
    )

    render(
      <Provider>
        <InstancesTable serviceId={undefined} />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    expect(await screen.findByText('Instances (0)')).toBeVisible()
    expect(mockeReq).toBeCalledTimes(0)
  })
})