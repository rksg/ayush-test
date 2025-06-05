import { rest } from 'msw'

import { Features, useIsBetaEnabled, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                    from '@acx-ui/rc/components'
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
  WorkflowUrls,
  getSelectPolicyRoutePath,
  RogueApUrls,
  SoftGreUrls,
  SyslogUrls,
  SwitchUrlsInfo,
  VlanPoolRbacUrls,
  WifiUrlsInfo,
  EthernetPortProfileUrls,
  RulesManagementUrlsInfo,
  MacRegListUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile } from '@acx-ui/user'
import { AccountTier }                    from '@acx-ui/utils'

import {
  macRegistrationPools,
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

const mockNewTableResult = {
  content: [],
  paging: {
    page: 0,
    pageSize: 0,
    totalCount: 0
  }
}

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
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
        WorkflowUrls.searchInProgressWorkflows.url.split('?')[0],
        (req, res, ctx ) => res(ctx.json(mockNewTableResult))
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
        (_, res, ctx) => res(ctx.json(mockSoftGreTable))),
      rest.get(
        SwitchUrlsInfo.getSwitchPortProfilesCount.url,
        (req, res, ctx) => res(ctx.json(1))
      ),
      rest.post(
        EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 1,
          data: []
        }))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({
          paging: {
            totalCount: 1,
            page: 0,
            pageSize: 0,
            pageCount: 1
          },
          content: [],
          links: []
        }))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(macRegistrationPools))
      ),
      rest.get(
        SwitchUrlsInfo.getAccessControlCount.url,
        (req, res, ctx) => res(ctx.json(5))
      )
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

  it('should render My Policies with Core Tier support', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: getUserProfile().profile,
      accountTier: AccountTier.CORE
    })
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

    expect(await screen.findByText('Client Isolation (0)')).toBeVisible()
    expect(screen.queryByText('Location Based Service Server')).toBeNull()
    expect(screen.queryByText('Workflow')).toBeNull()
    expect(screen.queryByText('Rogue AP Detection')).toBeNull()
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

  it('should render edge hqos bandwidth correctly', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff =>
      [Features.EDGE_QOS_TOGGLE, Features.EDGES_TOGGLE].includes(ff as Features))
    jest.mocked(useIsBetaEnabled).mockReturnValue(true)

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

    const edgeQosBandwidthTitle = 'HQoS Bandwidth (1)'
    expect(await screen.findByText(edgeQosBandwidthTitle)).toBeVisible()
    expect(await screen.findByTestId('RocketOutlined')).toBeVisible()
  })

  it('should render Authentication correctly', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.SWITCH_FLEXIBLE_AUTHENTICATION
    )

    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getFlexAuthenticationProfiles.url,
        (req, res, ctx) => res(ctx.json({
          data: [{
            id: '7de28fc02c0245648dfd58590884bad2',
            profileName: 'Profile01--auth10-guest5',
            authenticationType: '802.1x',
            dot1xPortControl: 'auto',
            authDefaultVlan: 10,
            restrictedVlan: 3,
            criticalVlan: 4,
            guestVlan: 5,
            authFailAction: 'restricted_vlan',
            authTimeoutAction: 'critical_vlan'
          }],
          totalCount: 1
        }))
      )
    )
    render(
      <Provider>
        <MyPolicies />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('Port Authentication (1)')).toBeVisible()
  })
  it('should render Port Profile correctly', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ETHERNET_PORT_PROFILE_TOGGLE ||
      ff === Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE
    )
    render(
      <Provider>
        <MyPolicies />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('Port Profiles (2)')).toBeVisible()
  })
  it('should render Access Control combined count when switch MAC ACL is enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE
    )

    render(
      <Provider>
        <MyPolicies />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('Access Control (5)')).toBeVisible()
  })
})
