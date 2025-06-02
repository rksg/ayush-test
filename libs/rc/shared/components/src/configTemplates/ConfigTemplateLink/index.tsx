import { ReactElement, ReactNode } from 'react'

import {
  ConfigTemplateType,
  LocationExtended,
  PolicyDetailsLinkProps,
  PolicyOperation,
  PolicyRoutePathProps,
  ServiceDetailsLinkProps,
  ServiceOperation,
  ServiceRoutePathProps,
  getConfigTemplatePath,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  useConfigTemplate,
  useConfigTemplateTenantLink,
  getServiceDetailsLink,
  getServiceRoutePath,
  configTemplateServiceTypeMap,
  configTemplatePolicyTypeMap
} from '@acx-ui/rc/utils'
import { LinkProps, MspTenantLink, Path, TenantLink, useLocation, useTenantLink } from '@acx-ui/react-router-dom'
import { RbacOpsIds, ScopeKeys }                                                  from '@acx-ui/types'

import { configTemplateDefaultDetailsTab } from './contentMap'

type GeneralConfigTemplateLinkProps<T> = T & {
  children: ReactNode
  attachCurrentPathToState?: boolean
  rbacOpsIds?: RbacOpsIds
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

// eslint-disable-next-line max-len
export function PolicyConfigTemplateLink (props: GeneralConfigTemplateLinkProps<PolicyRoutePathProps>) {
  const { children, attachCurrentPathToState = true, ...rest } = props
  return (
    // eslint-disable-next-line max-len
    <ConfigTemplateLink to={getPolicyRoutePath(rest)} attachCurrentPathToState={attachCurrentPathToState}>
      {props.children}
    </ConfigTemplateLink>
  )
}

// eslint-disable-next-line max-len
export function PolicyConfigTemplateDetailsLink (props: GeneralConfigTemplateLinkProps<PolicyDetailsLinkProps>) {
  const { children, attachCurrentPathToState = true, ...rest } = props
  return (
    // eslint-disable-next-line max-len
    <ConfigTemplateLink to={getPolicyDetailsLink(rest)} attachCurrentPathToState={attachCurrentPathToState}>
      {props.children}
    </ConfigTemplateLink>
  )
}

// eslint-disable-next-line max-len
interface PolicyConfigTemplateLinkSwitcherProps extends React.PropsWithChildren<PolicyDetailsLinkProps> {
  scopeKey?: ScopeKeys
  rbacOpsIds?: RbacOpsIds
}
// eslint-disable-next-line max-len
export function PolicyConfigTemplateLinkSwitcher (props: PolicyConfigTemplateLinkSwitcherProps) {
  const { isTemplate } = useConfigTemplate()
  const { type, oper, policyId, children } = props

  return isTemplate
    ? <PolicyConfigTemplateDetailsLink type={type} oper={oper} policyId={policyId}>
      {children}
    </PolicyConfigTemplateDetailsLink>
    : <TenantLink to={getPolicyDetailsLink({ type, oper, policyId })}>
      {children}
    </TenantLink>
}

// eslint-disable-next-line max-len
export function ServiceConfigTemplateLink (props: GeneralConfigTemplateLinkProps<ServiceRoutePathProps>) {
  const { children, attachCurrentPathToState = true, ...rest } = props
  return (
    // eslint-disable-next-line max-len
    <ConfigTemplateLink to={getServiceRoutePath(rest)} attachCurrentPathToState={attachCurrentPathToState}>
      {props.children}
    </ConfigTemplateLink>
  )
}

// eslint-disable-next-line max-len
export function ServiceConfigTemplateDetailsLink (props: GeneralConfigTemplateLinkProps<ServiceDetailsLinkProps>) {
  const { children, attachCurrentPathToState = true, ...rest } = props
  return (
    // eslint-disable-next-line max-len
    <ConfigTemplateLink to={getServiceDetailsLink(rest)} attachCurrentPathToState={attachCurrentPathToState}>
      {props.children}
    </ConfigTemplateLink>
  )
}

// eslint-disable-next-line max-len
interface ServiceConfigTemplateLinkSwitcherProps extends React.PropsWithChildren<ServiceDetailsLinkProps> {
  scopeKey?: ScopeKeys
  rbacOpsIds?: RbacOpsIds
}
// eslint-disable-next-line max-len
export function ServiceConfigTemplateLinkSwitcher (props: ServiceConfigTemplateLinkSwitcherProps) {
  const { isTemplate } = useConfigTemplate()
  const { type, oper, serviceId, children } = props

  return isTemplate
    ? <ServiceConfigTemplateDetailsLink type={type} oper={oper} serviceId={serviceId}>
      {children}
    </ServiceConfigTemplateDetailsLink>
    : <TenantLink to={getServiceDetailsLink({ type, oper, serviceId })}>
      {children}
    </TenantLink>
}

// eslint-disable-next-line max-len
export function renderConfigTemplateDetailsComponent (type: ConfigTemplateType, id: string, name: ReactNode, activeTab?: string): ReactElement {
  const targetTab = activeTab ?? configTemplateDefaultDetailsTab[type]
  const policyType = configTemplatePolicyTypeMap[type]
  const serviceType = configTemplateServiceTypeMap[type]

  if (policyType) {
    return <PolicyConfigTemplateDetailsLink
      type={policyType}
      oper={PolicyOperation.DETAIL}
      activeTab={targetTab as PolicyDetailsLinkProps['activeTab']}
      policyId={id}
      children={name}
    />
  } else if (serviceType) {
    return <ServiceConfigTemplateDetailsLink
      type={serviceType}
      oper={ServiceOperation.DETAIL}
      activeTab={targetTab as ServiceDetailsLinkProps['activeTab']}
      serviceId={id}
      children={name}
    />
  } else if (type === ConfigTemplateType.NETWORK) {
    // eslint-disable-next-line max-len
    return <ConfigTemplateLink to={`networks/wireless/${id}/network-details/${targetTab}`} children={name} />
  } else if (type === ConfigTemplateType.VENUE) {
    return <ConfigTemplateLink to={`venues/${id}/venue-details/${targetTab}`} children={name} />
  } else if (type === ConfigTemplateType.AP_GROUP) {
    return <ConfigTemplateLink to={`devices/apgroups/${id}/details/networks`} children={name} />
  } else if (type === ConfigTemplateType.IDENTITY_GROUP) {
    // eslint-disable-next-line max-len
    return <ConfigTemplateLink to={`identityManagement/identityGroups/${id}/details`} children={name} />
  }

  return <span>{name}</span>
}

// eslint-disable-next-line max-len
export function usePathBasedOnConfigTemplate (regularPath: string, configTemplatePath?: string): Path {
  const { isTemplate } = useConfigTemplate()
  const baseEditPath = useTenantLink(regularPath)
  const baseConfigTemplateEditPath = useConfigTemplateTenantLink(configTemplatePath ?? regularPath)

  return isTemplate ? baseConfigTemplateEditPath : baseEditPath
}
