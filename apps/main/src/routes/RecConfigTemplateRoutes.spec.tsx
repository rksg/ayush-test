import {
  ConfigTemplateType, PolicyOperation,
  PolicyType, ServiceOperation, ServiceType, getConfigTemplatePath,
  getPolicyRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import RecConfigTemplateRoutes from './RecConfigTemplateRoutes'

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  TenantNavigate: (props: { replace: boolean; to: string }) => <div>{JSON.stringify(props)}</div>
}))

jest.mock('@acx-ui/rc/components', () => ({
  useConfigTemplateVisibilityMap: () => mockedUseConfigTemplateVisibilityMap(),
  AAAForm: () => <div>AAAForm</div>,
  AAAPolicyDetail: () => <div>AAAPolicyDetail</div>,
  NetworkForm: () => <div>NetworkForm</div>,
  NetworkDetails: () => <div>NetworkDetails</div>,
  DpskForm: () => <div>DpskForm</div>,
  PortalForm: () => <div>PortalForm</div>
}))

jest.mock('@acx-ui/main/components', () => ({
  ConfigTemplateDpskDetails: () => <div>ConfigTemplateDpskDetails</div>,
  ConfigTemplatePortalDetails: () => <div>ConfigTemplatePortalDetails</div>
}))

jest.mock('../pages/Venues', () => ({
  VenuesForm: () => <div>VenuesForm</div>,
  VenueDetails: () => <div>VenueDetails</div>,
  VenueEdit: () => <div>VenueEdit</div>
}))

const mockedUseConfigTemplateVisibilityMap = jest.fn()

const mockedConfigTemplateVisibilityMap: Record<ConfigTemplateType, boolean> = {
  [ConfigTemplateType.NETWORK]: false,
  [ConfigTemplateType.VENUE]: false,
  [ConfigTemplateType.DPSK]: false,
  [ConfigTemplateType.RADIUS]: false,
  [ConfigTemplateType.DHCP]: false,
  [ConfigTemplateType.ACCESS_CONTROL]: false,
  [ConfigTemplateType.PORTAL]: false,
  [ConfigTemplateType.VLAN_POOL]: false,
  [ConfigTemplateType.WIFI_CALLING]: false,
  [ConfigTemplateType.CLIENT_ISOLATION]: false,
  [ConfigTemplateType.LAYER_2_POLICY]: false,
  [ConfigTemplateType.LAYER_3_POLICY]: false,
  [ConfigTemplateType.DEVICE_POLICY]: false,
  [ConfigTemplateType.APPLICATION_POLICY]: false,
  [ConfigTemplateType.ROGUE_AP_DETECTION]: false,
  [ConfigTemplateType.SYSLOG]: false,
  [ConfigTemplateType.SWITCH_REGULAR]: false,
  [ConfigTemplateType.SWITCH_CLI]: false,
  [ConfigTemplateType.AP_GROUP]: false,
  [ConfigTemplateType.ETHERNET_PORT_PROFILE]: false,
  [ConfigTemplateType.IDENTITY_GROUP]: false
}

describe('RecConfigTemplateRoutes', () => {
  beforeEach(() => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({ ...mockedConfigTemplateVisibilityMap })
  })

  it('should navigate to the default page of the config template', async () => {
    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(),
        wrapRoutes: false
      }
    })

    // eslint-disable-next-line max-len
    expect(await screen.findByText('{"replace":true,"to":"configTemplates/templates"}')).toBeVisible()
  })

  it('should navigate to the templates page', async () => {
    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath() + '/templates',
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('ConfigTemplatePage')).toBeVisible()
  })

  it('should navigate to the RADIUS Server config template create', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.RADIUS]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(
          getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('AAAForm')).toBeVisible()
  })

  it('should navigate to the RADIUS Server config template edit', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.RADIUS]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/:tenantId/t/' + getConfigTemplatePath(
          getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.EDIT })
        ),
        params: {
          tenantId: '123',
          policyId: '123'
        },
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('AAAForm')).toBeVisible()
  })

  it('should navigate to the RADIUS Server config template detail', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.RADIUS]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(
          getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.DETAIL })
        ),
        params: {
          tenantId: '123',
          policyId: '123'
        },
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('AAAPolicyDetail')).toBeVisible()
  })

  it('should navigate to the Network config template add', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.NETWORK]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath('networks/wireless/add'),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('NetworkForm')).toBeVisible()
  })

  it('should navigate to the Network config template edit', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.NETWORK]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath('networks/wireless/123/edit'),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('NetworkForm')).toBeVisible()
  })

  it('should navigate to the Network details', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.NETWORK]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(
          'networks/wireless/123/network-details/general'
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('NetworkDetails')).toBeVisible()
  })

  it('should navigate to the Venues config template add', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.VENUE]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath('venues/add'),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('VenuesForm')).toBeVisible()
  })

  it('should navigate to the Venue edit', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.VENUE]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath('venues/123/edit/general'),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('VenueEdit')).toBeVisible()
  })

  it('should navigate to the Venue details', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.VENUE]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(
          'venues/123/venue-details/general'
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('VenueDetails')).toBeVisible()
  })

  it('should navigate to the DPSK config template create', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.DPSK]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(
          getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('DpskForm')).toBeVisible()
  })

  it('should navigate to the DPSK config template edit', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.DPSK]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(
          getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.EDIT })
        ),
        params: {
          tenantId: '123',
          serviceId: '123'
        },
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('DpskForm')).toBeVisible()
  })

  it('should navigate to the DPSK config template detail', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.DPSK]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(
          getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })
        ),
        params: {
          tenantId: '123',
          serviceId: '123',
          activeTab: 'general'
        },
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('ConfigTemplateDpskDetails')).toBeVisible()
  })

  it('should navigate to the Portal config template create', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.PORTAL]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(
          getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('PortalForm')).toBeVisible()
  })

  it('should navigate to the Portal config template edit', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.PORTAL]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(
          getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.EDIT })
        ),
        params: {
          tenantId: '123',
          serviceId: '123'
        },
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('PortalForm')).toBeVisible()
  })

  it('should navigate to the Portal config template detail', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.PORTAL]: true
    })

    render(<Provider><RecConfigTemplateRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getConfigTemplatePath(
          getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.DETAIL })
        ),
        params: {
          tenantId: '123',
          serviceId: '123'
        },
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('ConfigTemplatePortalDetails')).toBeVisible()
  })
})
