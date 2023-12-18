import { render, screen } from '@testing-library/react'

import { PolicyOperation, PolicyType, getConfigTemplateLink, getPolicyRoutePath } from '@acx-ui/rc/utils'

import {
  PolicyConfigTemplateLink
} from '.'

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  MspTenantLink: (props: { to: string }) => <div>{props.to}</div>
}))

describe('ConfigTemplateLink', () => {
  it('renders children with PolicyConfigTemplateLink', () => {
    const targetPolicyParams = { type: PolicyType.AAA, oper: PolicyOperation.CREATE }
    render(
      // eslint-disable-next-line max-len
      <PolicyConfigTemplateLink type={targetPolicyParams.type} oper={targetPolicyParams.oper}>Policy Test Child</PolicyConfigTemplateLink>
    )

    const targetPath = getConfigTemplateLink(getPolicyRoutePath(targetPolicyParams))
    expect(screen.getByText(targetPath)).toBeInTheDocument()
  })
})
