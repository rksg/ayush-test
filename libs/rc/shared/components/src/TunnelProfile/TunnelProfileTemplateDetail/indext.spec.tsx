import { rest } from 'msw'

import { EdgeConfigTemplateUrlsInfo, EdgeTunnelProfileFixtures, getConfigTemplatePath, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                      from '@acx-ui/store'
import { mockServer, render, screen }                                                                                                    from '@acx-ui/test-utils'

import { TunnelProfileTemplateDetail } from '.'

jest.mock('./NetworkTable', () => ({
  NetworkTable: () => <div data-testid='NetworkTable'>NetworkTable</div>
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures

describe('TunnelProfileTemplateDetail', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeConfigTemplateUrlsInfo.getTunnelProfileTemplateViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      )
    )
  })

  it('should render correctly', () => {
    render(
      <Provider>
        <TunnelProfileTemplateDetail />
      </Provider>, {
        route: {
          path: '/tenantId/v/' + getConfigTemplatePath(
            getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.DETAIL })
          ),
          params: { policyId: 'test-id' }
        }
      })

    expect(screen.getByTestId('NetworkTable')).toBeVisible()
    expect(screen.getByText('Tunnel Type')).toBeVisible()
    expect(screen.getByText('VXLAN GPE')).toBeVisible()
    expect(screen.getByText('Destination')).toBeVisible()
    expect(screen.getByText('EdgeCluster1')).toBeVisible()
    expect(screen.getByText('Network Segment Type')).toBeVisible()
    expect(screen.getByText('VNI')).toBeVisible()
    expect(screen.getByText('NAT-T Support')).toBeVisible()
    expect(screen.getAllByText('On')[0]).toBeVisible()
    expect(screen.getByText('Gateway Path MTU Mode')).toBeVisible()
    expect(screen.getByText('Manual (1450)')).toBeVisible()
    expect(screen.getByText('PMTU Timeout')).toBeVisible()
    expect(screen.getByText('10 milliseconds')).toBeVisible()
    expect(screen.getByText('PMTU Retries')).toBeVisible()
    expect(screen.getAllByText('1 retries')[0]).toBeVisible()
    expect(screen.getByText('Force Fragmentation')).toBeVisible()
    expect(screen.getAllByText('On')[1]).toBeVisible()
    expect(screen.getByText('Tunnel Idle Timeout')).toBeVisible()
    expect(screen.getByText('20 minutes')).toBeVisible()
    expect(screen.getByText('Keep Alive Interval')).toBeVisible()
    expect(screen.getByText('1000 seconds')).toBeVisible()
    expect(screen.getByText('Keep Alive Retries')).toBeVisible()
    expect(screen.getAllByText('1 retries')[1]).toBeVisible()
    expect(screen.getByText('Instances (2)')).toBeVisible()
  })
})