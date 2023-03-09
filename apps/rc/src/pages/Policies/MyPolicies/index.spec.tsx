import _        from 'lodash'
import { rest } from 'msw'

import {
  CommonUrlsInfo,
  getSelectPolicyRoutePath,
  PolicyType, RogueApUrls
} from '@acx-ui/rc/utils';
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

  const path = '/t/:tenantId'

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
    ),
  )

  it('should render My Policies', async () => {
    render(
      <Provider>
        <MyPolicies />
      </Provider>, {
        route: { params, path }
      }
    )

    const createPageLink = `/t/${params.tenantId}/` + getSelectPolicyRoutePath()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Add Policy or Profile' })).toHaveAttribute('href', createPageLink)

    const rogueApCount = mockedRogueApPoliciesList.totalCount
    const rogueApTitle = `Rogue AP Detection (${rogueApCount})`
    expect(await screen.findByText(rogueApTitle)).toBeVisible()

    expect(await screen.findByText('Client Isolation (0)')).toBeVisible()
  })
})
