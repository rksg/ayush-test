import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { PolicyType }     from '@acx-ui/rc/utils'
import { Path }           from '@acx-ui/react-router-dom'
import { render, screen } from '@acx-ui/test-utils'

import { getPolicyRoutePath, getSelectPolicyRoutePath, PolicyOperation } from '../policyRouteUtils'

import SelectPolicyForm from '.'

const mockedUsedNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('SelectPolicyForm', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  it('should render form', async () => {
    const { asFragment } = render(
      <SelectPolicyForm />, {
        route: { params, path: '/:tenantId/' + getSelectPolicyRoutePath() }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to the correct policy page', async () => {
    render(
      <SelectPolicyForm />, {
        route: { params, path: '/:tenantId/' + getSelectPolicyRoutePath() }
      }
    )

    await userEvent.click(screen.getByRole('radio', { name: /Rogue AP Detection/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    const policyCreatePath = getPolicyRoutePath({
      type: PolicyType.ROGUE_AP_DETECTION,
      oper: PolicyOperation.CREATE
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${policyCreatePath}`
    })
  })
})
