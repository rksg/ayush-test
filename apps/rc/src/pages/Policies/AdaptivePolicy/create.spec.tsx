/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { render, screen }                                  from '@acx-ui/test-utils'

import CreateAdaptivePolicyProfile from './create'

const mockedUseNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => jest.fn().mockImplementation(path => path)
}))

describe('CreateAdaptivePolicyProfile', () => {
  const params = { tenantId: 'tenant-id' }

  const createPath = '/:tenantId/t/' + getPolicyRoutePath({
    type: PolicyType.ADAPTIVE_POLICY_PROFILE,
    oper: PolicyOperation.CREATE
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the form with policy selected by default', async () => {
    render(
      <Provider>
        <CreateAdaptivePolicyProfile />
      </Provider>, {
        route: { params, path: createPath }
      }
    )
    expect(screen.getByText('Add Adaptive Policy Instance')).toBeInTheDocument()
    expect(screen.getByText('Template Instance Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Adaptive Policy')).toBeChecked()
    expect(screen.getByText('Template Instance Type')).toBeInTheDocument()
    expect(screen.getByText('Adaptive Policy Set')).toBeInTheDocument()
    expect(screen.getByText('RADIUS Attribute Group')).toBeInTheDocument()
  })

  it('should navigate to policy path when policy is selected', async () => {
    render(
      <Provider>
        <CreateAdaptivePolicyProfile />
      </Provider>, {
        route: { params, path: createPath }
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUseNavigate).toHaveBeenCalled()
  })

  it('should navigate to group path when group is selected', async () => {
    render(
      <Provider>
        <CreateAdaptivePolicyProfile />
      </Provider>, {
        route: { params, path: createPath }
      }
    )
    await userEvent.click(screen.getByRole('radio', { name: /RADIUS Attribute Group/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUseNavigate).toHaveBeenCalled()
  })
})
