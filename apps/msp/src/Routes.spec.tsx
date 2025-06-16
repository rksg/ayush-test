import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ConfigTemplateType, PolicyOperation,
  PolicyType, ServiceOperation, ServiceType, getConfigTemplatePath,
  getPolicyRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import HspContext                      from './HspContext'
import { Init, ConfigTemplatesRoutes } from './Routes'

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  Navigate: props => <div>{JSON.stringify(props)}</div>
}))

jest.mock('./pages/ConfigTemplates', () => ({
  ...jest.requireActual('./pages/ConfigTemplates'),
  ConfigTemplatePage: () => <div>ConfigTemplatePage</div>
}))

const mockedUseConfigTemplateVisibilityMap = jest.fn()
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useConfigTemplateVisibilityMap: () => mockedUseConfigTemplateVisibilityMap(),
  AAAForm: () => <div>AAAForm</div>,
  AccessControlForm: () => <div>AccessControlForm</div>,
  NetworkForm: () => <div>NetworkForm</div>,
  DpskForm: () => <div>DpskForm</div>,
  DHCPForm: () => <div>DHCPForm</div>,
  PortalForm: () => <div>PortalForm</div>,
  VLANPoolForm: () => <div>VLANPoolForm</div>,
  ConfigurationProfileForm: () => <div>ConfigurationProfileForm</div>,
  CliProfileForm: () => <div>CliProfileForm</div>,
  IdentityGroupForm: () => <div>IdentityGroupForm</div>
}))

jest.mock('@acx-ui/main/components', () => ({
  ...jest.requireActual('@acx-ui/main/components'),
  VenuesForm: () => <div>VenuesForm</div>
}))

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

jest.mocked(useIsSplitOn).mockReturnValue(false)
jest.mocked(useIsTierAllowed).mockReturnValue(false)

describe('Init', () => {
  it('navigates to dashboard if brand360 is not available', async () => {
    render(<Init />, {
      route: {
        path: '/tenantId/v',
        wrapRoutes: false
      }
    })
    expect(await screen.findByText(
      '{"replace":true,"to":{"pathname":"/undefined/v/dashboard"}}'
    )).toBeVisible()
  })
  it('navigates to brand360 when available', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(ff => ff === Features.MSP_BRAND_360)
    jest.mocked(useIsTierAllowed).mockReturnValue(ff => ff === Features.MSP_HSP_360_PLM_FF)
    render(<HspContext.Provider value={{ state: { isHsp: true }, dispatch: jest.fn() }}>
      <Init />
    </HspContext.Provider>, {
      route: {
        path: '/tenantId/v',
        wrapRoutes: false
      }
    })
    expect(await screen.findByText(
      '{"replace":true,"to":{"pathname":"/undefined/v/brand360"}}'
    )).toBeVisible()
  })
})
describe('MspRoutes: ConfigTemplatesRoutes', () => {
  beforeEach(() => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({ ...mockedConfigTemplateVisibilityMap })
  })

  it('should navigate to the default page of the config template', async () => {
    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('ConfigTemplatePage')).toBeVisible()
  })

  it('should navigate to the RADIUS Server config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.RADIUS]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('AAAForm')).toBeVisible()
  })

  it('should navigate to the Access Control config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.ACCESS_CONTROL]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('AccessControlForm')).toBeVisible()
  })

  it('should navigate to the Network config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.NETWORK]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath('networks/wireless/add'),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('NetworkForm')).toBeVisible()
  })

  it('should navigate to the Venues config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.VENUE]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath('venues/add'),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('VenuesForm')).toBeVisible()
  })

  it('should navigate to the DPSK config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.DPSK]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('DpskForm')).toBeVisible()
  })

  it('should navigate to the DHCP config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.DHCP]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('DHCPForm')).toBeVisible()
  })

  it('should navigate to the Portal config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.PORTAL]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('PortalForm')).toBeVisible()
  })

  it('should navigate to the VLAN Pool config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.VLAN_POOL]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('VLANPoolForm')).toBeVisible()
  })
  it('should navigate to the Switch regular profile config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.SWITCH_REGULAR]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath('networks/wired/profiles/add'),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('ConfigurationProfileForm')).toBeVisible()
  })

  it('should navigate to the Switch cli profile config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.SWITCH_CLI]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath('networks/wired/profiles/cli/add'),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('CliProfileForm')).toBeVisible()
  })

  it('should navigate to the Identity Group config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.IDENTITY_GROUP]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath('identityManagement/identityGroups/add'),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('IdentityGroupForm')).toBeVisible()
  })
})
