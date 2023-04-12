import { rest } from 'msw'

import {
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  RadiusAttributeGroupUrlsInfo, RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockGroup, policyList, policySetList, prioritizedPolicies, templateList } from './__tests__/fixtures'
import RadiusAttributeGroupDetail                                                  from './RadiusAttributeGroupDetail'

describe('RadiusAttributeGroupDetail', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: mockGroup.id
  }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroup.url,
        (req, res, ctx) => res(ctx.json(mockGroup))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url,
        (req, res, ctx) => res(ctx.json(policyList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url,
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPrioritizedPolicies.url,
        (req, res, ctx) => res(ctx.json(prioritizedPolicies))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateList.url,
        (req, res, ctx) => res(ctx.json(templateList))
      )
    )
  })

  // eslint-disable-next-line max-len
  const path = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.DETAIL })

  it('should render correctly', async () => {
    render(<Provider><RadiusAttributeGroupDetail /></Provider>, {
      route: { params, path }
    })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const names = await screen.findAllByText(mockGroup.name)
    expect(names[0]).toBeVisible()
    expect(names[1]).toBeVisible()

    await screen.findByText(mockGroup.attributeAssignments[0].attributeName)
    await screen.findByText(mockGroup.attributeAssignments[0].attributeValue)
    await screen.findByText(mockGroup.attributeAssignments[1].attributeName)
    await screen.findByText(mockGroup.attributeAssignments[1].attributeValue)
    await screen.findByText('Instance (' + policyList.content.length + ')')
    await screen.findByRole('row', { name: /ap2 3/i })
  })

  it('should navigate to edit page', async () => {
    const editLink = `/t/${params.tenantId}/` + getPolicyDetailsLink({
      type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
      oper: PolicyOperation.EDIT,
      policyId: params.policyId
    })

    render(<Provider><RadiusAttributeGroupDetail /></Provider>, {
      route: { params, path }
    })

    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
