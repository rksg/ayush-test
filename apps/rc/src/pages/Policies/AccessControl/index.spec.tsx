import userEvent from '@testing-library/user-event'

import * as featureToggle from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'
import * as userModule    from '@acx-ui/user'


import AccessControl from './index'

const mockedUseNavigate = jest.fn()
const mockedTenantPath = { pathname: '/tenant-id/t', search: '', hash: '' }

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  AccessControlTabs: () => <div>Wi-Fi Access Control Tabs</div>,
  useWifiAclTotalCount: () => ({
    isFetching: false,
    data: {
      totalCount: 15,
      aclCount: 1,
      l2AclCount: 2,
      l3AclCount: 3,
      deviceAclCount: 4,
      appAclCount: 5
    }
  }),
  useSwitchAclTotalCount: () => ({
    isFetching: false,
    data: {
      totalCount: 3,
      switchMacAclCount: 1,
      switchL2AclCount: 2
    }
  }),
  useAclTotalCount: () => ({
    isFetching: false,
    data: {
      totalCount: 18
    }
  })
}))

jest.mock('../SwitchAccessControl', () => ({
  SwitchAccessControl: () => <div>Switch Access Control Tabs</div>
}))

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => mockedTenantPath,
  useParams: () => ({ activeTab: 'wifi' })
}))

describe('AccessControl', () => {
  const params = { tenantId: 'tenant-id' }
  beforeEach(() => {
    jest.spyOn(userModule, 'hasCrossVenuesPermission').mockReturnValue(true)
    jest.spyOn(userModule, 'filterByAccess').mockImplementation((children) => children)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render with feature toggle enabled', async () => {
    jest.spyOn(featureToggle, 'useIsSplitOn').mockReturnValue(true)

    render(
      <Provider>
        <AccessControl />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/wifi' }
      })

    expect(screen.getByText('Access Control (18)')).toBeInTheDocument()
    expect(screen.getByText('Wi-Fi (15)')).toBeInTheDocument()
    expect(screen.getByText('Switch (3)')).toBeInTheDocument()
    expect(screen.getByText('Add Access Control Set')).toBeInTheDocument()
  })

  it('should render without switch tab when feature toggle is disabled', async () => {
    jest.spyOn(featureToggle, 'useIsSplitOn').mockReturnValue(false)

    render(
      <Provider>
        <AccessControl />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/wifi' }
      })

    expect(screen.getByText('Access Control (18)')).toBeInTheDocument()
    expect(screen.getByText('Add Access Control Set')).toBeInTheDocument()
    expect(screen.queryByText('Switch (3)')).not.toBeInTheDocument()
  })

  it('should navigate when tab is changed', async () => {
    jest.spyOn(featureToggle, 'useIsSplitOn').mockReturnValue(true)

    render(
      <Provider>
        <AccessControl />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/wifi' }
      })

    await userEvent.click(screen.getByText('Switch (3)'))

    expect(mockedUseNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: expect.stringContaining('/switch')
      }),
      { replace: true }
    )
  })
})
