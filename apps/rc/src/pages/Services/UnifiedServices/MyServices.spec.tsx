import { hasSomeServicesPermission, ServiceOperation } from '@acx-ui/rc/utils'
import { render, screen }                              from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile }              from '@acx-ui/user'

import { mockedUnifiedServicesListWithTotalCount } from './__tests__/fixtures'
import { AddProfileButton, MyServices }            from './MyServices'

const mockUseUnifiedServiceListWithTotalCount = jest.fn()
jest.mock('./useUnifiedServiceListWithTotalCount', () => ({
  useUnifiedServiceListWithTotalCount: () => mockUseUnifiedServiceListWithTotalCount()
}))

jest.mock('./useUnifiedServiceSearchFilter', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useUnifiedServiceSearchFilter: (list: any) => ({
    setSearchTerm: jest.fn(),
    setFilters: jest.fn(),
    setSortOrder: jest.fn(),
    filteredServices: list
  }),
  getDefaultSearchFilterValues: jest.fn(() => ({
    filters: {
      products: [],
      categories: []
    },
    sortOrder: 0
  }))
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  canCreateAnyUnifiedService: jest.fn(() => true),
  getServiceCatalogRoutePath: jest.fn(() => '/service-catalog')
}))

jest.mock('../UnifiedServiceCard', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UnifiedServiceCard: ({ unifiedService }: any) => (
    <div>ServiceCard: {unifiedService.type}</div>
  )
}))
jest.mock('./ServicesToolBar', () => ({
  ServicesToolBar: () => <div>ServicesToolBar</div>,
  ServiceSortOrder: {
    ASC: 'asc',
    DESC: 'desc'
  }
}))
jest.mock('./SkeletonLoaderCard', () => ({
  SkeletonLoaderCard: () => <div>SkeletonLoaderCard</div>
}))

describe('<MyServices />', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/:tenantId/t'

  beforeEach(() => {
    mockUseUnifiedServiceListWithTotalCount.mockReturnValue({
      unifiedServiceListWithTotalCount: mockedUnifiedServicesListWithTotalCount,
      isFetching: false
    })
  })
  it('renders the page header and services', () => {
    render(<MyServices />, { route: { params, path } })

    const targetService1 = mockedUnifiedServicesListWithTotalCount[0]
    const targetService2 = mockedUnifiedServicesListWithTotalCount[1]

    expect(screen.getByText('My Services')).toBeInTheDocument()
    expect(screen.getByText('Add Service')).toBeInTheDocument()
    expect(screen.getByText('ServicesToolBar')).toBeInTheDocument()
    expect(screen.getByText(`ServiceCard: ${targetService1.type}`)).toBeInTheDocument()
    expect(screen.getByText(`ServiceCard: ${targetService2.type}`)).toBeInTheDocument()
  })

  it('renders skeleton loading when isFetching', () => {
    mockUseUnifiedServiceListWithTotalCount.mockReturnValue({
      unifiedServiceListWithTotalCount: [],
      isFetching: true
    })

    render(<MyServices />, { route: { params, path } })

    expect(screen.getByText('SkeletonLoaderCard')).toBeInTheDocument()
  })
})

describe('AddProfileButton', () => {
  it('renders the link when permission is allowed and operation check is enabled', () => {
    setUserProfile({
      ...getUserProfile(),
      allowedOperations: ['POST:/wifiCallingServiceProfiles'],
      rbacOpsApiEnabled: true
    })

    render(
      <AddProfileButton
        hasSomeProfilesPermission={() => hasSomeServicesPermission(ServiceOperation.CREATE)}
        linkText={'Add Service'}
        targetPath={'/add-service'}
      />,{
        route: { params: { tenantId: '_TENANT_ID' }, path: '/:tenantId' }
      }
    )

    expect(screen.getByText('Add Service')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/_TENANT_ID/t/add-service')
  })

  it('returns null when no permission and operation check is enabled', () => {
    setUserProfile({
      ...getUserProfile(),
      allowedOperations: [],
      rbacOpsApiEnabled: true
    })

    render(
      <AddProfileButton
        hasSomeProfilesPermission={() => hasSomeServicesPermission(ServiceOperation.CREATE)}
        linkText={'Add Service'}
        targetPath={'/add-service'}
      />,{
        route: { params: { tenantId: '_TENANT_ID' }, path: '/:tenantId' }
      }
    )

    expect(screen.queryByText('Add Service')).toBeNull()
  })

  it('renders the link when operation check is disabled', () => {
    setUserProfile({
      ...getUserProfile(),
      allowedOperations: [],
      rbacOpsApiEnabled: false
    })

    render(
      <AddProfileButton
        hasSomeProfilesPermission={() => hasSomeServicesPermission(ServiceOperation.CREATE)}
        linkText={'Add Service'}
        targetPath={'/add-service'}
      />,{
        route: { params: { tenantId: '_TENANT_ID' }, path: '/:tenantId' }
      }
    )

    expect(screen.getByText('Add Service')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/_TENANT_ID/t/add-service')
  })
})
