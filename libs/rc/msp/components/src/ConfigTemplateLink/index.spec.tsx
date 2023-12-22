import { render, screen } from '@testing-library/react'

import { PolicyDetailsLinkProps, PolicyOperation, PolicyRoutePathProps, PolicyType, getConfigTemplateLink, getPolicyDetailsLink, getPolicyRoutePath } from '@acx-ui/rc/utils'

import {
  PolicyConfigTemplateDetailsLink,
  PolicyConfigTemplateLink
} from '.'

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  MspTenantLink: (props: { to: string }) => <div>{props.to}</div>
}))

describe('ConfigTemplateLink', () => {
  it('renders children with PolicyConfigTemplateLink', () => {
    // eslint-disable-next-line max-len
    const targetPolicyParams: PolicyRoutePathProps = { type: PolicyType.AAA, oper: PolicyOperation.CREATE }
    render(
      <PolicyConfigTemplateLink {...targetPolicyParams}>Policy Test Child</PolicyConfigTemplateLink>
    )

    const targetPath = getConfigTemplateLink(getPolicyRoutePath(targetPolicyParams))
    expect(screen.getByText(targetPath)).toBeInTheDocument()
  })

  it('renders children with PolicyConfigTemplateDetailsLink', () => {
    const targetPolicyParams: PolicyDetailsLinkProps = {
      type: PolicyType.AAA,
      oper: PolicyOperation.DETAIL,
      policyId: 'AAA12345'
    }

    render(
      // eslint-disable-next-line max-len
      <PolicyConfigTemplateDetailsLink {...targetPolicyParams}>Policy Details Child</PolicyConfigTemplateDetailsLink>
    )

    const targetPath = getConfigTemplateLink(getPolicyDetailsLink(targetPolicyParams))
    expect(screen.getByText(targetPath)).toBeInTheDocument()
  })
})
