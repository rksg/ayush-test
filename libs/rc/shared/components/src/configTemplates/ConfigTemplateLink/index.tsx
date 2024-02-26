import { ReactNode } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button }        from '@acx-ui/components'
import {
  ConfigTemplateType,
  DpskDetailsTabKey,
  LocationExtended,
  PolicyDetailsLinkProps,
  PolicyOperation,
  PolicyRoutePathProps,
  PolicyType,
  ServiceDetailsLinkProps,
  ServiceOperation,
  ServiceRoutePathProps,
  ServiceType,
  getConfigTemplatePath,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  useConfigTemplate,
  useConfigTemplateTenantLink,
  getServiceDetailsLink,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { LinkProps, MspTenantLink, Path, TenantLink, useLocation, useTenantLink } from '@acx-ui/react-router-dom'

import { ApplicationDrawer, DeviceOSDrawer, Layer2Drawer, Layer3Drawer } from '../../policies'

type OptionProps = {
  [key in ConfigTemplateType]?: {
    [subKey: string]: string
  }
}

interface ConfigTemplateLinkProps extends Omit<LinkProps, 'to'> {
  to: string
  attachCurrentPathToState?: boolean
}
export function ConfigTemplateLink (props: ConfigTemplateLinkProps) {
  const { to, attachCurrentPathToState = true, state = {}, ...rest } = props
  const location = useLocation()
  // eslint-disable-next-line max-len
  const currentPathState: LocationExtended['state'] | {} = attachCurrentPathToState ? { from: location } : {}
  const finalState = { ...state, ...currentPathState }

  return (
    <MspTenantLink to={getConfigTemplatePath(to)} state={finalState} {...rest}>
      {props.children}
    </MspTenantLink>
  )
}

interface PolicyConfigTemplateLinkProps extends PolicyRoutePathProps {
	children: ReactNode
  attachCurrentPathToState?: boolean
}
export function PolicyConfigTemplateLink (props: PolicyConfigTemplateLinkProps) {
  const { children, attachCurrentPathToState = true, ...rest } = props
  return (
    // eslint-disable-next-line max-len
    <ConfigTemplateLink to={getPolicyRoutePath(rest)} attachCurrentPathToState={attachCurrentPathToState}>
      {props.children}
    </ConfigTemplateLink>
  )
}

interface PolicyConfigTemplateDetailsLinkProps extends PolicyDetailsLinkProps {
	children: ReactNode
  attachCurrentPathToState?: boolean
}
export function PolicyConfigTemplateDetailsLink (props: PolicyConfigTemplateDetailsLinkProps) {
  const { children, attachCurrentPathToState = true, ...rest } = props
  return (
    // eslint-disable-next-line max-len
    <ConfigTemplateLink to={getPolicyDetailsLink(rest)} attachCurrentPathToState={attachCurrentPathToState}>
      {props.children}
    </ConfigTemplateLink>
  )
}

interface ServiceConfigTemplateLinkProps extends ServiceRoutePathProps {
	children: ReactNode
  attachCurrentPathToState?: boolean
}
export function ServiceConfigTemplateLink (props: ServiceConfigTemplateLinkProps) {
  const { children, attachCurrentPathToState = true, ...rest } = props
  return (
    // eslint-disable-next-line max-len
    <ConfigTemplateLink to={getServiceRoutePath(rest)} attachCurrentPathToState={attachCurrentPathToState}>
      {props.children}
    </ConfigTemplateLink>
  )
}

interface ServiceConfigTemplateDetailsLinkProps extends ServiceDetailsLinkProps {
	children: ReactNode
  attachCurrentPathToState?: boolean
}
export function ServiceConfigTemplateDetailsLink (props: ServiceConfigTemplateDetailsLinkProps) {
  const { children, attachCurrentPathToState = true, ...rest } = props
  return (
    // eslint-disable-next-line max-len
    <ConfigTemplateLink to={getServiceDetailsLink(rest)} attachCurrentPathToState={attachCurrentPathToState}>
      {props.children}
    </ConfigTemplateLink>
  )
}

// eslint-disable-next-line max-len
export function ServiceConfigTemplateConfigureLinkSwitcher (props: { type: ServiceType, serviceId: string, disabled?: boolean }) {
  const { isTemplate } = useConfigTemplate()
  const { type, serviceId, disabled = false } = props
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const button = <Button key='configure' disabled={disabled} type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>

  return isTemplate
    ? <ServiceConfigTemplateDetailsLink
      type={type}
      oper={ServiceOperation.EDIT}
      serviceId={serviceId}
    >
      {button}
    </ServiceConfigTemplateDetailsLink>
    : <TenantLink to={getServiceDetailsLink({
      type,
      oper: ServiceOperation.EDIT,
      serviceId
    })}>
      {button}
    </TenantLink>
}

// eslint-disable-next-line max-len
export function renderConfigTemplateDetailsComponent (type: ConfigTemplateType, id: string, name: string, option: OptionProps = {}) {
  let activeTab = ''
  switch (type) {
    case ConfigTemplateType.RADIUS:
      // eslint-disable-next-line max-len
      return <PolicyConfigTemplateDetailsLink type={PolicyType.AAA} oper={PolicyOperation.DETAIL} policyId={id} children={name} />
    case ConfigTemplateType.DPSK:
      return <ServiceConfigTemplateDetailsLink
        type={ServiceType.DPSK}
        oper={ServiceOperation.DETAIL}
        activeTab={DpskDetailsTabKey.OVERVIEW}
        serviceId={id}
        children={name}
      />
    case ConfigTemplateType.DHCP:
      // eslint-disable-next-line max-len
      return <ServiceConfigTemplateDetailsLink type={ServiceType.DHCP} oper={ServiceOperation.DETAIL} serviceId={id} children={name} />
    case ConfigTemplateType.NETWORK:
      activeTab = option[ConfigTemplateType.NETWORK]?.activeTab || 'venues'
      // eslint-disable-next-line max-len
      return <ConfigTemplateLink to={`networks/wireless/${id}/network-details/${activeTab}`} children={name} />
    case ConfigTemplateType.VENUE:
      activeTab = option[ConfigTemplateType.VENUE]?.activeTab || 'networks'
      // eslint-disable-next-line max-len
      return <ConfigTemplateLink to={`venues/${id}/venue-details/${activeTab}`} children={name} />
    case ConfigTemplateType.ACCESS_CONTROL_SET:
      // eslint-disable-next-line max-len
      return <PolicyConfigTemplateDetailsLink type={PolicyType.ACCESS_CONTROL} oper={PolicyOperation.DETAIL} policyId={id} children={name} />
    case ConfigTemplateType.LAYER_2_POLICY:
      return <Form><Layer2Drawer
        isOnlyViewMode={true}
        onlyViewMode={{ id: id, viewText: name }}
      /></Form>
    case ConfigTemplateType.LAYER_3_POLICY:
      return <Form><Layer3Drawer
        isOnlyViewMode={true}
        onlyViewMode={{ id: id, viewText: name }}
      /></Form>
    case ConfigTemplateType.DEVICE_POLICY:
      return <Form><DeviceOSDrawer
        isOnlyViewMode={true}
        onlyViewMode={{ id: id, viewText: name }}
      /></Form>
    case ConfigTemplateType.APPLICATION_POLICY:
      return <Form><ApplicationDrawer
        isOnlyViewMode={true}
        onlyViewMode={{
          id: id,
          viewText: name
        }}
      /></Form>
    default:
      return name
  }
}

// eslint-disable-next-line max-len
export function usePathBasedOnConfigTemplate (regularPath: string, configTemplatePath?: string): Path {
  const { isTemplate } = useConfigTemplate()
  const baseEditPath = useTenantLink(regularPath)
  const baseConfigTemplateEditPath = useConfigTemplateTenantLink(configTemplatePath ?? regularPath)

  return isTemplate ? baseConfigTemplateEditPath : baseEditPath
}
