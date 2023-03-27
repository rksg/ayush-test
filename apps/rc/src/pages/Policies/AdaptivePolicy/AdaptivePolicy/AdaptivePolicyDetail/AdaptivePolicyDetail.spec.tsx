import { rest } from 'msw'

import { RulesManagementUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { adpativePolicy, assignConditions } from './__test__/fixtures'
import { AdaptivePolicyDetail }             from './AdaptivePolicyDetail'


describe('AdaptivePolicyDetail', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicyByTemplate.url,
        (req, res, ctx) => res(ctx.json(adpativePolicy))
      ),
      rest.get(
        RulesManagementUrlsInfo.getConditionsInPolicy.url,
        (req, res, ctx) => res(ctx.json(assignConditions))
      )
    )
  })

  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: '373377b0cb6e46ea8982b1c80aabe1fa',
    templateId: '200'
  }

  const path = '/:tenantId/:templateId/:policyId'

  it('should render correctly', async () => {
    render(<Provider><AdaptivePolicyDetail /></Provider>, {
      route: { params, path }
    })

    await screen.findByText('Policy Name')

    const names = await screen.findAllByText(adpativePolicy.name)
    expect(names).toHaveLength(2)
    expect(names[0]).toBeVisible()
    expect(names[1]).toBeVisible()

    // eslint-disable-next-line max-len
    expect(await screen.findByText(assignConditions.content[0].evaluationRule.regexStringCriteria ?? '')).toBeVisible()
  })

})
