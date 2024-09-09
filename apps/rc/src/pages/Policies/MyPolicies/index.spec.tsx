import { rest } from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }  from '@acx-ui/rc/components'
import {
  connectionMeteringApi,
  policyApi
} from '@acx-ui/rc/services'
import {
  AaaUrls,
  AccessControlUrls,
  ApSnmpUrls,
  ClientIsolationUrls,
  ConnectionMeteringUrls,
  EdgeHqosProfilesUrls,
  getSelectPolicyRoutePath,
  RogueApUrls, SoftGreUrls, SyslogUrls, VlanPoolRbacUrls, WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  mockedClientIsolationQueryData,
  mockedRogueApPoliciesList,
  mockedVlanPoolProfilesQueryData,
  mockSoftGreTable
} from './__tests__/fixtures'

import MyPolicies from '.'


const mockTableResult = {
  totalCount: 0,
  data: []
}

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('MyPolicies', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/:tenantId/t'
  beforeEach(() => {
    store.dispatch(connectionMeteringApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())
    mockServer.use(
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        AaaUrls.queryAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        AccessControlUrls.getEnhancedAccessControlProfiles.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        ClientIsolationUrls.getEnhancedClientIsolationList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        SyslogUrls.syslogPolicyList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        ApSnmpUrls.getApSnmpFromViewModel.url,
        (_, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        AaaUrls.queryAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.get(
        ConnectionMeteringUrls.getConnectionMeteringList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        RogueApUrls.getEnhancedRoguePolicyList.url,
        (req, res, ctx) => res(ctx.json(mockedRogueApPoliciesList))
      ),
      rest.post(
        RogueApUrls.getRoguePolicyListRbac.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 99,
          data: []
        }))
      ),
      rest.post(
        AccessControlUrls.getAccessControlProfileQueryList.url,
        (_, res, ctx) => res(ctx.json({
          totalCount: 1,
          data: []
        }))
      ),
      rest.post(
        SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockSoftGreTable)))
    )
  })


  it('should render My Policies', async () => {
    render(
      <Provider>
        <MyPolicies />
      </Provider>, {
        route: { params, path }
      }
    )

    const createPageLink = `/${params.tenantId}/t/` + getSelectPolicyRoutePath()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Add Policy or Profile' })).toHaveAttribute('href', createPageLink)

    const rogueApCount = mockedRogueApPoliciesList.totalCount
    const rogueApTitle = `Rogue AP Detection (${rogueApCount})`
    expect(await screen.findByText(rogueApTitle)).toBeVisible()

    expect(await screen.findByText('Client Isolation (0)')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <MyPolicies />
      </Provider>, {
        route: { params, path }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
  })

  it('should render Rogue AP with RBAC on', async () => {
    const mockQueryResult = {
      totalCount: 1,
      page: 1,
      data: [{
        id: 'b76d9aeb1d5e4fc8b62ed6250a6471ee',
        name: 'Syslog 1',
        venueIds: [],
        primaryServer: '1.2.3.4:514 (UDP)',
        secondaryServer: '',
        facility: 'KEEP_ORIGINAL',
        flowLevel: 'CLIENT_FLOW'
      }]
    }

    mockServer.use(
      rest.post(
        SyslogUrls.querySyslog.url,
        (_req, res, ctx) => res(ctx.json(mockQueryResult))
      ),
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_req, res, ctx) => res(ctx.json(mockedVlanPoolProfilesQueryData))
      ),
      rest.post(
        ClientIsolationUrls.queryClientIsolation.url,
        (_req, res, ctx) => res(ctx.json(mockedClientIsolationQueryData))
      )
    )

    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

    render(
      <Provider>
        <MyPolicies />
      </Provider>, {
        route: { params, path }
      }
    )

    const rogueApTitle = 'Rogue AP Detection (99)'
    expect(await screen.findByText(rogueApTitle)).toBeVisible()

    const vlanPoolTitle = 'VLAN Pools (0)'
    expect(await screen.findByText(vlanPoolTitle)).toBeVisible()

    const clientIsolationTitle = 'Client Isolation (1)'
    expect(await screen.findByText(clientIsolationTitle)).toBeVisible()

    const accessControlTitle = 'Access Control (1)'
    expect(await screen.findByText(accessControlTitle)).toBeVisible()
  })

  it('should render edge qos bandwidth correctly', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff =>
      [Features.EDGE_QOS_TOGGLE, Features.EDGES_TOGGLE].includes(ff as Features))

    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (_req, res, ctx) => res(ctx.json(mockedClientIsolationQueryData))
      ),
      rest.post(
        ClientIsolationUrls.queryClientIsolation.url,
        (_req, res, ctx) => res(ctx.json(mockedClientIsolationQueryData))
      ),
      rest.post(
        SyslogUrls.querySyslog.url,
        (_req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
    render(
      <Provider>
        <MyPolicies />
      </Provider>, {
        route: { params, path }
      }
    )

    const edgeQosBandwidthTitle = 'QoS Bandwidth (1)'
    expect(await screen.findByText(edgeQosBandwidthTitle)).toBeVisible()
  })
})