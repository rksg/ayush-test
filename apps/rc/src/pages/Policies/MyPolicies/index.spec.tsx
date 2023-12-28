import _        from 'lodash'
import { rest } from 'msw'

import {
  AaaUrls,
  AccessControlUrls,
  ApSnmpUrls,
  ClientIsolationUrls,
  CommonUrlsInfo,
  ConnectionMeteringUrls,
  getSelectPolicyRoutePath,
  PolicyType, RogueApUrls, SyslogUrls, WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  mockedRogueApPoliciesList,
  emptyPoliciesList
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
      rest.get(
        ConnectionMeteringUrls.getConnectionMeteringList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getPoliciesList.url,
        (req, res, ctx) => {
          const type = _.get(req, 'body.filters.type') as string[]

          if (type.includes(PolicyType.ROGUE_AP_DETECTION)) {
            return res(ctx.json({ ...mockedRogueApPoliciesList }))
          }
          return res(ctx.json({ ...emptyPoliciesList }))
        }
      ),
      rest.post(
        RogueApUrls.getEnhancedRoguePolicyList.url,
        (req, res, ctx) => res(ctx.json(mockedRogueApPoliciesList))
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
})
