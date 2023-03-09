import userEvent from '@testing-library/user-event'

import { RadioCardCategory } from '@acx-ui/components'
import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { To, useTenantLink } from '@acx-ui/react-router-dom'
import {
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { hasRoles } from '@acx-ui/user'

import { ServiceCard } from '.'


jest.mock('@acx-ui/user')
const mockedHasRoles = hasRoles as jest.MockedFunction<typeof hasRoles>

const mockedUseNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To) => to
}))

describe('ServiceCard', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/t/:tenantId'

  beforeEach(() => {
    mockedHasRoles.mockReturnValue(true)
  })

  it('should render LIST service card', async () => {
    const { result: listPath } = renderHook(() => {
      return useTenantLink(getServiceRoutePath({
        type: ServiceType.MDNS_PROXY,
        oper: ServiceOperation.LIST
      }))
    })

    render(
      <ServiceCard
        serviceType={ServiceType.MDNS_PROXY}
        categories={[RadioCardCategory.WIFI]}
        type={'default'}
      />, {
        route: { params, path }
      }
    )

    await userEvent.click(await screen.findByText('mDNS Proxy'))

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
      <ServiceCard
        serviceType={ServiceType.MDNS_PROXY}
        categories={[RadioCardCategory.WIFI]}
        type={'button'}
      />, {
        route: { params, path }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    expect(mockedUseNavigate).toHaveBeenCalledWith(createPath.current)
  })

  it('should render service card with the count number', async () => {
    render(
      <ServiceCard
        serviceType={ServiceType.MDNS_PROXY}
        categories={[RadioCardCategory.WIFI]}
        type={'default'}
        count={5}
      />, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('mDNS Proxy (5)')).toBeVisible()
  })

  it('should render readonly service card', async () => {
    mockedHasRoles.mockReturnValue(false)

    render(
      <ServiceCard
        serviceType={ServiceType.MDNS_PROXY}
        categories={[RadioCardCategory.WIFI]}
        type={'button'}
      />, {
        route: { params, path }
      }
    )

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Add' })).toBeNull()
    }, {
      timeout: 2000,
      interval: 200
    })
  })
})
