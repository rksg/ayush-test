import _        from 'lodash'
import { rest } from 'msw'

import { useIsSplitOn }     from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  getSelectPolicyRoutePath,
  PolicyType, RogueApUrls
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


describe('MyPolicies', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/:tenantId/t'

  mockServer.use(
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

  it('should not render breadcrumb when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <MyPolicies />
      </Provider>, {
        route: { params, path }
      }
    )
    expect(screen.queryByText('Network Control')).toBeNull()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
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
