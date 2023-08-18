/* eslint-disable max-len */
import { rest } from 'msw'

import { DdosAttackType, EdgeFirewallUrls, EdgeStatus } from '@acx-ui/rc/utils'
import { Provider }                                     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockFirewall, mockedFirewallDataList } from './__tests__/fixtures'

import  EdgeFirewall from './'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeFirewallGroupedStatsTables: () => <div data-testid='rc-EdgeFirewallGroupedStatsTables' />
}))

const mockedGetFirewallFn = jest.fn()
const mockedEdgeStatus = {
  name: 'mock-SmartEdge',
  serialNumber: '0000000001',
  venueId: '00001',
  firewallId: 'mock-serviceId'
}

describe('Venue Firewall Service', () => {
  let params: { tenantId: string, venueId: string }

  beforeEach(() => {
    params = {
      tenantId: 't-tenant',
      venueId: 't-venue'
    }

    mockServer.use(
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (req, res, ctx) => {
          mockedGetFirewallFn()
          return res(ctx.json(mockFirewall))
        }
      ),
      rest.post(
        EdgeFirewallUrls.getEdgeFirewallViewDataList.url,
        (req, res, ctx) => {
          return res(ctx.json(mockedFirewallDataList))
        }
      )
    )

    mockedGetFirewallFn.mockReset()
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <EdgeFirewall edgeData={mockedEdgeStatus as EdgeStatus} />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetFirewallFn).toBeCalled()
    })

    // display firewall config data
    expect(await screen.findByRole('link', { name: 'mocked-firewall' })).toBeVisible()
    const ddosInfo = screen.queryByText('DDoS Rate-limiting')
    // eslint-disable-next-line testing-library/no-node-access
    const ddosWrapper = ddosInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(ddosWrapper).queryByText('OFF')).toBeValid()
    const aclInfo = screen.queryAllByText('Stateful ACL').filter(elem => elem.tagName === 'SPAN')[0]
    // eslint-disable-next-line testing-library/no-node-access
    const aclWrapper = aclInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(aclWrapper).queryByText('ON (IN: 1 rule, OUT: 5 rules)')).toBeValid()

    const edgeInfo = screen.queryByText('SmartEdge')
    // eslint-disable-next-line testing-library/no-node-access
    const edgeWrapper = edgeInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(edgeWrapper).queryByText('mock-SmartEdge')).toBeValid()

    // display grouped table
    expect(screen.queryByTestId('rc-EdgeFirewallGroupedStatsTables')).toBeVisible()
  })

  it('should render correctly when ddos enabled', async () => {
    const mockFirewallDDosEnabled = {
      ...mockFirewall,
      serviceName: 'mocked-firewall2',
      ddosRateLimitingEnabled: true,
      ddosRateLimitingRules: [
        {
          ddosAttackType: DdosAttackType.ICMP,
          rateLimiting: 200
        },
        {
          ddosAttackType: DdosAttackType.NTP_REFLECTION,
          rateLimiting: 120
        }
      ],
      statefulAclEnabled: false
    }

    mockServer.use(
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (req, res, ctx) => {
          mockedGetFirewallFn()
          return res(ctx.json(mockFirewallDDosEnabled))
        }
      )
    )

    render(
      <Provider>
        <EdgeFirewall edgeData={mockedEdgeStatus as EdgeStatus} />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetFirewallFn).toBeCalled()
    })

    // display firewall config data
    expect(await screen.findByRole('link', { name: 'mocked-firewall2' })).toBeVisible()
    const ddosInfo = screen.queryByText('DDoS Rate-limiting')
    // eslint-disable-next-line testing-library/no-node-access
    const ddosWrapper = ddosInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(ddosWrapper).queryByText('ON (2 rules)')).toBeValid()
    const aclInfo = screen.queryAllByText('Stateful ACL').filter(elem => elem.tagName === 'SPAN')[0]
    // eslint-disable-next-line testing-library/no-node-access
    const aclWrapper = aclInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(aclWrapper).queryByText('OFF')).toBeValid()

    // display grouped table
    expect(screen.queryByTestId('rc-EdgeFirewallGroupedStatsTables')).toBeVisible()
  })
})
