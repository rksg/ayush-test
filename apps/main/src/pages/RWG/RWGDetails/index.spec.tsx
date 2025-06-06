import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { rwgApi }                                                 from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, RWG, RWGClusterNode, RWGStatusEnum } from '@acx-ui/rc/utils'
import { Provider, store }                                        from '@acx-ui/store'
import { fireEvent, mockServer, render, screen }                  from '@acx-ui/test-utils'


import { RWGDetails } from '.'

const gatewayResponse = {
  requestId: 'request-id',
  response: {
    rwgId: 'bbc41563473348d29a36b76e95c50381',
    venueId: '3f10af1401b44902a88723cb68c4bc77',
    venueName: 'My-Venue',
    name: 'ruckusdemos',
    hostname: 'https://rxgs5-vpoc.ruckusdemos.net',
    apiKey: 'xxxxxxxxxxxxxxx',
    status: RWGStatusEnum.ONLINE,
    isCluster: false,
    clusterNodes: [{
      id: 'cluster1',
      name: 'cluster1',
      ip: '12.12.12.12'
    },{
      id: 'cluster2',
      name: 'cluster2',
      ip: '12.12.12.13'
    }] as RWGClusterNode[]
  } as RWG
}

const gatewayResponse1 = {
  requestId: 'request-id',
  response: {
    rwgId: 'bbc41563473348d29a36b76e95c50381',
    venueId: '3f10af1401b44902a88723cb68c4bc77',
    venueName: 'My-Venue',
    name: 'ruckusdemos',
    hostname: 'https://rxgs5-vpoc.ruckusdemos.net',
    apiKey: 'xxxxxxxxxxx',
    status: RWGStatusEnum.ONLINE,
    isCluster: false
  } as RWG
}

jest.mock('./GatewayOverviewTab', () => ({
  GatewayOverviewTab: () => <div
    data-testid={'rc-GatewayOverviewTab'}
    title='GatewayOverviewTab' />
}))

describe('RWGDetails', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    store.dispatch(rwgApi.util.resetApiState())
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
      gatewayId: 'bbc41563473348d29a36b76e95c50381',
      venueId: '3f10af1401b44902a88723cb68c4bc77',
      activeTab: 'overview',
      clusterNodeId: 'cluster1'
    }
    mockServer.use(
      rest.get(
        CommonRbacUrlsInfo.getGateway.url,
        (req, res, ctx) => res(ctx.json(gatewayResponse))
      )
    )
    render(<Provider><RWGDetails /></Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:venueId/:gatewayId/gateway-details/:activeTab' }
    })
    expect(await screen.findByText('ruckusdemos')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(1)

    await fireEvent.click(await screen.findByRole('button', { name: 'Configure' }))
    await fireEvent.click(screen.getByRole('menuitem', { name: 'Configure RWG' }))

    await expect(window.open).toBeCalledTimes(1)

  })

  it('test status with offline', async () => {
    const params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
      gatewayId: 'bbc41563473348d29a36b76e95c50381',
      venueId: '3f10af1401b44902a88723cb68c4bc77',
      activeTab: 'overview'
    }
    mockServer.use(
      rest.get(
        CommonRbacUrlsInfo.getGateway.url,
        (req, res, ctx) => res(ctx.json(gatewayResponse1))
      )
    )
    render(<Provider><RWGDetails /></Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:venueId/:gatewayId/gateway-details/:activeTab' }
    })
    expect(await screen.findByText('ruckusdemos')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(1)

  })

})
