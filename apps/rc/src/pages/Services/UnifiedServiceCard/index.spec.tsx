import userEvent from '@testing-library/user-event'

import { RadioCardCategory } from '@acx-ui/components'
import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation,
  getServiceCatalogRoutePath,
  ExtendedUnifiedService,
  UnifiedServiceSourceType,
  UnifiedServiceCategory
} from '@acx-ui/rc/utils'
import { To, useTenantLink } from '@acx-ui/react-router-dom'
import {
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { RolesEnum, WifiScopes }          from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import { UnifiedServiceCard } from '.'


const mockedUseNavigate = jest.fn()
const mockUseLocationValue = {
  pathname: getServiceCatalogRoutePath(),
  search: '',
  hash: '',
  state: null
}
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To) => to,
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))

describe('UnifiedServiceCard', () => {
  const params = { tenantId: '15320bc221d94d2cb537fa0189fee742' }
  const path = '/t/:tenantId'
  const mockedUnifiedService: ExtendedUnifiedService = {
    type: ServiceType.MDNS_PROXY,
    sourceType: UnifiedServiceSourceType.SERVICE,
    label: 'mDNS Proxy',
    products: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
    route: getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.LIST }),
    category: UnifiedServiceCategory.MONITORING_TROUBLESHOOTING,
    disabled: false,
    description: 'Mocked mDNS Proxy description',
    totalCount: 5
  }

  it('should render LIST service card', async () => {
    const { result: listPath } = renderHook(() => {
      return useTenantLink(getServiceRoutePath({
        type: ServiceType.MDNS_PROXY,
        oper: ServiceOperation.LIST
      }))
    })

    render(
      <UnifiedServiceCard unifiedService={mockedUnifiedService} type={'default'} />, {
        route: { params, path }
      }
    )

    const target = await screen.findByText('mDNS Proxy (5)')
    await userEvent.click(target)

    expect(mockedUseNavigate).toHaveBeenCalledWith(listPath.current)
  })

  it('should render ADD service card', async () => {
    const { result: createPath } = renderHook(() => {
      return useTenantLink(getServiceRoutePath({
        type: ServiceType.MDNS_PROXY,
        oper: ServiceOperation.CREATE
      }))
    })

    render(
      <UnifiedServiceCard unifiedService={mockedUnifiedService} type={'button'} />, {
        route: { params, path }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    expect(mockedUseNavigate).toHaveBeenCalledWith(createPath.current, {
      state: {
        from: mockUseLocationValue
      }
    })
  })

  it('should render service card with the BetaIndicator', async () => {
    render(
      <UnifiedServiceCard
        unifiedService={{ ...mockedUnifiedService, isBetaFeature: true }}
        type={'default'}
      />, {
        route: { params, path }
      }
    )

    expect(await screen.findByTestId('RocketOutlined')).toBeVisible()
  })

  it('should render readonly service card', async () => {
    setUserProfile({
      ...getUserProfile(),
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })

    render(
      <UnifiedServiceCard unifiedService={mockedUnifiedService} type={'button'} />, {
        route: { params, path }
      }
    )

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    })
  })

  describe('with specific permissions', () => {
    it('should render correctly with the corresponding custom role', async () => {
      setUserProfile({
        ...getUserProfile(),
        abacEnabled: true,
        isCustomRole: true,
        scopes: [WifiScopes.READ, WifiScopes.UPDATE]
      })
      render(
        <UnifiedServiceCard unifiedService={mockedUnifiedService} type={'button'} />, {
          route: { params, path }
        }
      )
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
      })
    })

    it('shoulde render correctly with the DPSK access', async () => {
      setUserProfile({
        ...getUserProfile(),
        profile: { ...getUserProfile().profile, roles: [RolesEnum.DPSK_ADMIN] }
      })

      render(
        <UnifiedServiceCard
          unifiedService={{
            type: ServiceType.DPSK,
            sourceType: UnifiedServiceSourceType.SERVICE,
            label: 'DPSK',
            products: [RadioCardCategory.WIFI],
            route: getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST }),
            category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
            disabled: false,
            description: 'Mocked DPSK description',
            totalCount: 5
          }}
          type={'button'}
        />, {
          route: { params, path }
        }
      )

      expect(await screen.findByRole('button', { name: 'Add' })).toBeInTheDocument()
    })
  })
})
