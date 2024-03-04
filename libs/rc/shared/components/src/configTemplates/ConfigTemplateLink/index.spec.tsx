import {
  ConfigTemplateType,
  getConfigTemplatePath,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  getServiceDetailsLink,
  getServiceRoutePath,
  PolicyDetailsLinkProps,
  PolicyOperation,
  PolicyType,
  ServiceDetailsLinkProps,
  ServiceOperation,
  ServiceRoutePathProps,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantType, To } from '@acx-ui/react-router-dom'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import {
  ConfigTemplateLink,
  PolicyConfigTemplateDetailsLink,
  PolicyConfigTemplateLink,
  renderConfigTemplateDetailsComponent,
  ServiceConfigTemplateLink,
  ServiceConfigTemplateLinkSwitcher,
  usePathBasedOnConfigTemplate
} from '.'

const mockedMspTenantLinkStateFn = jest.fn()
const mockedLocation = { pathname: 'previous/path' }
const mockedLocationFn = jest.fn().mockReturnValue(mockedLocation)
// eslint-disable-next-line max-len
const mockedUseTenantLink = jest.fn().mockImplementation((to: To, tenantType: TenantType) => ({ to, tenantType }))
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MspTenantLink: (props: { to: string, state: any }) => {
    mockedMspTenantLinkStateFn(props.state)
    return <div>{props.to}</div>
  },
  TenantLink: (props: { to: string }) => <div>{props.to}</div>,
  useLocation: () => mockedLocationFn(),
  useTenantLink: (to: To, tenantType: TenantType) => mockedUseTenantLink(to, tenantType)
}))

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('ConfigTemplateLink', () => {
  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
  })

  afterEach(() => {
    mockedMspTenantLinkStateFn.mockClear()
    mockedUseConfigTemplate.mockRestore()
    mockedUseTenantLink.mockClear()
  })

  it('renders ConfigTemplateLink with state prop', () => {
    render(<ConfigTemplateLink to='test/config'>Config Template Link</ConfigTemplateLink>)

    const targetPath = getConfigTemplatePath('test/config')
    expect(screen.getByText(targetPath)).toBeInTheDocument()
    expect(mockedMspTenantLinkStateFn).toHaveBeenCalledWith({ from: mockedLocation })
  })

  it('renders children with PolicyConfigTemplateLink', () => {
    const targetPolicyParams = { type: PolicyType.AAA, oper: PolicyOperation.CREATE }
    render(
      <PolicyConfigTemplateLink {...targetPolicyParams}>Policy Test Child</PolicyConfigTemplateLink>
    )

    const targetPath = getConfigTemplatePath(getPolicyRoutePath(targetPolicyParams))
    expect(screen.getByText(targetPath)).toBeInTheDocument()
  })

  it('renders children with PolicyConfigTemplateDetailsLink', () => {
    const targetPolicyParams: PolicyDetailsLinkProps = {
      type: PolicyType.AAA,
      oper: PolicyOperation.DETAIL,
      policyId: 'AAA12345'
    }

    render(
      // eslint-disable-next-line max-len
      <PolicyConfigTemplateDetailsLink {...targetPolicyParams}>Policy Details Child</PolicyConfigTemplateDetailsLink>
    )

    const targetPath = getConfigTemplatePath(getPolicyDetailsLink(targetPolicyParams))
    expect(screen.getByText(targetPath)).toBeInTheDocument()
  })

  it('shoulde render renderConfigTemplateDetailsComponent correctly', () => {
    const { rerender } = render(
      renderConfigTemplateDetailsComponent(ConfigTemplateType.VENUE, 'venue_id', 'venue_name')
    )

    // default activeTab : networks
    // eslint-disable-next-line max-len
    expect(screen.getByText(getConfigTemplatePath('venues/venue_id/venue-details/networks'))).toBeInTheDocument()

    rerender(
      renderConfigTemplateDetailsComponent(ConfigTemplateType.RADIUS, 'radius_id', 'radius_name')
    )
    // eslint-disable-next-line max-len
    expect(screen.getByText(getConfigTemplatePath('policies/aaa/radius_id/detail'))).toBeInTheDocument()

    rerender(
      renderConfigTemplateDetailsComponent(ConfigTemplateType.DPSK, 'dpsk_id', 'dpsk_name')
    )
    // eslint-disable-next-line max-len
    expect(screen.getByText(getConfigTemplatePath('services/dpsk/dpsk_id/detail/overview'))).toBeInTheDocument()

    rerender(
      renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, 'network_id', 'network_name')
    )
    // eslint-disable-next-line max-len
    expect(screen.getByText(getConfigTemplatePath('networks/wireless/network_id/network-details/venues'))).toBeInTheDocument()
  })

  it('should render the correct service link with the config template flag', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

    // eslint-disable-next-line max-len
    const targetProps: ServiceDetailsLinkProps = { type: ServiceType.DHCP, oper: ServiceOperation.EDIT, serviceId: '123456' }
    const targetPath = getServiceDetailsLink(targetProps)

    const { rerender } = render(<ServiceConfigTemplateLinkSwitcher
      type={targetProps.type}
      oper={targetProps.oper}
      serviceId={targetProps.serviceId}
      children={'DHCP Edit Page'}
    />, { route: { path: '/tenantId/t/test' } })

    expect(screen.getByText(getConfigTemplatePath(targetPath))).toBeInTheDocument()

    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

    rerender(<ServiceConfigTemplateLinkSwitcher
      type={targetProps.type}
      oper={targetProps.oper}
      serviceId={targetProps.serviceId}
      children={'DHCP Edit Page'}
    />)

    expect(screen.getByText(targetPath)).toBeInTheDocument()
  })

  it('should render the correct base path with the config template flag', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    // eslint-disable-next-line max-len
    const { result: templateResult } = renderHook(() => usePathBasedOnConfigTemplate('regular', 'template'))
    expect(templateResult.current).toEqual({
      to: 'configTemplates/template',
      tenantType: 'v'
    })

    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    // eslint-disable-next-line max-len
    const { result: regularResult } = renderHook(() => usePathBasedOnConfigTemplate('regular', 'template'))
    expect(regularResult.current).toEqual({
      to: 'regular',
      tenantType: undefined
    })
  })

  it('renders ServiceConfigTemplateLink', () => {
    // eslint-disable-next-line max-len
    const targetProps: ServiceRoutePathProps = { type: ServiceType.DHCP, oper: ServiceOperation.CREATE }
    const targetPath = getServiceRoutePath(targetProps)

    render(<ServiceConfigTemplateLink
      type={targetProps.type}
      oper={targetProps.oper}
      children={'DHCP Creation page'}
    />)

    expect(screen.getByText(getConfigTemplatePath(targetPath))).toBeInTheDocument()
  })
})
