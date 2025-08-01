import { rest } from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { HspContext }                               from '@acx-ui/msp/utils'
import {
  ConfigTemplateType, PolicyOperation,
  PolicyType, ServiceOperation, ServiceType, getConfigTemplatePath,
  getPolicyRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { NavigateProps }              from '@acx-ui/react-router-dom'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import MspRoutes, { Init, ConfigTemplatesRoutes } from './Routes'

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  Navigate: (props: NavigateProps) => <div>{JSON.stringify(props)}</div>
}))

jest.mock('@acx-ui/config-template/msp/components', () => ({
  ...jest.requireActual('@acx-ui/config-template/msp/components'),
  ConfigTemplatePage: () => <div>ConfigTemplatePage</div>
}))

jest.mock('./pages/Layout', () => ({
  ...jest.requireActual('./pages/Layout'),
  default: () => <div>Layout</div>
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantType: 'MSP' })
}))

const mockedUseConfigTemplateVisibilityMap = jest.fn()
jest.mock('@acx-ui/rc/components', () => ({
  useConfigTemplateVisibilityMap: () => mockedUseConfigTemplateVisibilityMap(),
  withTemplateFeatureGuard: () => jest.fn(),
  AAAForm: () => <div>AAAForm</div>,
  AccessControlForm: () => <div>AccessControlForm</div>,
  NetworkForm: () => <div>NetworkForm</div>,
  DpskForm: () => <div>DpskForm</div>,
  DHCPForm: () => <div>DHCPForm</div>,
  PortalForm: () => <div>PortalForm</div>,
  VLANPoolForm: () => <div>VLANPoolForm</div>,
  CliProfileForm: () => <div>CliProfileForm</div>,
  IdentityGroupForm: () => <div>IdentityGroupForm</div>,
  WifiCallingForm: () => <div>WifiCallingForm</div>,
  AddEthernetPortProfile: () => <div>AddEthernetPortProfile</div>,
  SyslogForm: () => <div>SyslogForm</div>,
  RogueAPDetectionForm: () => <div>RogueAPDetectionForm</div>,
  ApGroupEdit: () => <div>ApGroupEdit</div>,
  AccessControlDetail: () => <div>AccessControlDetail</div>,
  AAAPolicyDetail: () => <div>AccessControlDetail</div>,
  NetworkDetails: () => <div>NetworkDetails</div>,
  VLANPoolDetail: () => <div>VLANPoolDetail</div>,
  DHCPDetail: () => <div>DHCPDetail</div>,
  PersonaGroupDetails: () => <div>PersonaGroupDetails</div>,
  WifiCallingConfigureForm: () => <div>WifiCallingConfigureForm</div>,
  WifiCallingDetailView: () => <div>WifiCallingDetailView</div>,
  EditEthernetPortProfile: () => <div>EditEthernetPortProfile</div>,
  EthernetPortProfileDetail: () => <div>EthernetPortProfileDetail</div>,
  SyslogDetailView: () => <div>SyslogDetailView</div>,
  RogueAPDetectionDetailView: () => <div>RogueAPDetectionDetailView</div>,
  ApGroupDetails: () => <div>ApGroupDetails</div>,
  AddTunnelProfileTemplate: () => <div>AddTunnelProfileTemplate</div>,
  EditTunnelProfileTemplate: () => <div>EditTunnelProfileTemplate</div>
}))

jest.mock('@acx-ui/main/components', () => ({
  VenuesForm: () => <div>VenuesForm</div>,
  VenueDetails: () => <div>VenueDetails</div>,
  VenueEdit: () => <div>VenueEdit</div>,
  ConfigTemplateDpskDetails: () => <div>ConfigTemplateDpskDetails</div>,
  ConfigTemplatePortalDetails: () => <div>ConfigTemplatePortalDetails</div>
}))

jest.mock('@acx-ui/analytics/components', () => ({
  Brand360: () => <div>Brand360</div>
}))

jest.mock('@acx-ui/reports/components', () => ({
  DataStudio: () => <div>DataStudio</div>
}))

jest.mock('@acx-ui/switch/components', () => ({
  ConfigurationProfileForm: () => <div>ConfigurationProfileForm</div>
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
  [ConfigTemplateType.IDENTITY_GROUP]: false,
  [ConfigTemplateType.TUNNEL_SERVICE]: false
}

jest.mocked(useIsSplitOn).mockReturnValue(false)
jest.mocked(useIsTierAllowed).mockReturnValue(false)

describe('Init', () => {
  beforeEach(() => {
    mockServer.use(rest.get(
      '/locales/compiled/en-US.json',
      (req, res, ctx) => res(ctx.json({ language: 'Language' }))
    ))
  })

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
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_BRAND_360)
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === Features.MSP_HSP_360_PLM_FF)
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

  it('should navigate to the default page of the msp', async () => {
    render(<Provider><MspRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/',
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('Layout')).toBeVisible()
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

  it('should navigate to the Wi-Fi Calling config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.WIFI_CALLING]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('WifiCallingForm')).toBeVisible()
  })

  it('should navigate to the Ethernet Port config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.ETHERNET_PORT_PROFILE]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          // eslint-disable-next-line max-len
          getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE, oper: PolicyOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('AddEthernetPortProfile')).toBeVisible()
  })

  it('should navigate to the Syslog config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.SYSLOG]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('SyslogForm')).toBeVisible()
  })

  it('should navigate to the Rogue AP Detection config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.ROGUE_AP_DETECTION]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('RogueAPDetectionForm')).toBeVisible()
  })

  it('should navigate to the AP Group config template', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.AP_GROUP]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath('devices/apgroups/create'),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('ApGroupEdit')).toBeVisible()
  })

  it('should navigate to the create Tunnel Profile config template page', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.TUNNEL_SERVICE]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.CREATE })
        ),
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('AddTunnelProfileTemplate')).toBeVisible()
  })

  it('should navigate to the edit Tunnel Profile config template page', async () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.TUNNEL_SERVICE]: true
    })

    render(<Provider><ConfigTemplatesRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/' + getConfigTemplatePath(
          getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.EDIT })
        ),
        params: { policyId: 'test-id' },
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('EditTunnelProfileTemplate')).toBeVisible()
  })
})
