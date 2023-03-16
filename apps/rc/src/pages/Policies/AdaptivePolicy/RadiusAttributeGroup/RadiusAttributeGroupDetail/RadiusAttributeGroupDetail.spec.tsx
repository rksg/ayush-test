import { rest } from 'msw'

import {
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  RadiusAttributeGroupUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockGroup }              from './__tests__/fixtures'
import RadiusAttributeGroupDetail from './RadiusAttributeGroupDetail'

describe('RadiusAttributeGroupDetail', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: mockGroup.id
  }
  mockServer.use(
    rest.get(
      RadiusAttributeGroupUrlsInfo.getAttributeGroup.url,
      (req, res, ctx) => res(ctx.json(mockGroup))
    )
  )

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
    // eslint-disable-next-line max-len
    expect(await screen.findByText(mockGroup.attributeAssignments[0].attributeName)).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText(mockGroup.attributeAssignments[0].attributeValue)).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText(mockGroup.attributeAssignments[1].attributeName)).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText(mockGroup.attributeAssignments[1].attributeValue)).toBeVisible()
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

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))


    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
