import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import {
  PolicyType,
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  PolicyOperation,
  getPolicyListRoutePath
} from '@acx-ui/rc/utils'
import { Path, useTenantLink }        from '@acx-ui/react-router-dom'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import SelectPolicyForm from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('SelectPolicyForm', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  const selectPolicyPath = '/:tenantId/' + getSelectPolicyRoutePath()

  it('should navigate to the correct policy page', async () => {
    render(
      <SelectPolicyForm />, {
        route: { params, path: '/:tenantId/' + getSelectPolicyRoutePath() }
      }
    )

    await userEvent.click(screen.getByDisplayValue(/Rogue AP Detection/))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    const policyCreatePath = getPolicyRoutePath({
      type: PolicyType.ROGUE_AP_DETECTION,
      oper: PolicyOperation.CREATE
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${policyCreatePath}`
    })
  })

  it('should navigate to the policies list when cancel the form', async () => {
    const { result } = renderHook(() => useTenantLink(getPolicyListRoutePath(true)))

    render(
      <SelectPolicyForm />, {
        route: { params, path: selectPolicyPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith(result.current)
  })
})
