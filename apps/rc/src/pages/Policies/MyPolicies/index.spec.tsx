import { rest } from 'msw'

import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import {
  AaaUrls,
  AccessControlUrls,
  ApSnmpUrls,
  ClientIsolationUrls,
  ConnectionMeteringUrls,
  getSelectPolicyRoutePath,
  RogueApUrls, SyslogUrls, WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  mockedRogueApPoliciesList
} from './__tests__/fixtures'

import MyPolicies from '.'


const mockTableResult = {
  totalCount: 0,
  data: []
}

describe('MyPolicies', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/:tenantId/t'
  beforeEach(() => {
    mockServer.use(
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
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
      ))

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
  })
})
