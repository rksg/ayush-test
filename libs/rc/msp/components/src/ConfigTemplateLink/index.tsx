import { ReactNode } from 'react'

import {
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  getNetworkConfigTemplateLink,
  getPolicyConfigTemplateLink,
  getServiceConfigTemplateLink,
  getVenueConfigTemplateLink
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

interface ConfigTemplateLinkProps {
  children: ReactNode
  path: string
}
export function ConfigTemplateLink (props: ConfigTemplateLinkProps) {
  return (
    <TenantLink tenantType='v' to={props.path}>
      {props.children}
    </TenantLink>
  )
}

interface PolicyConfigTemplateProps {
	children: ReactNode
  policyType: PolicyType
  policyOperation: PolicyOperation
}
export function PolicyConfigTemplateLink (props: PolicyConfigTemplateProps) {
  return (
    <ConfigTemplateLink
      path={getPolicyConfigTemplateLink({ type: props.policyType, oper: props.policyOperation })}
    >
      {props.children}
    </ConfigTemplateLink>
  )
}

interface ServiceConfigTemplateProps {
	children: ReactNode
  serviceType: ServiceType
  serviceOperation: ServiceOperation
}
export function ServiceConfigTemplateLink (props: ServiceConfigTemplateProps) {
  return (
    <ConfigTemplateLink
      path={getServiceConfigTemplateLink({ type: props.serviceType, oper: props.serviceOperation })}
    >
      {props.children}
    </ConfigTemplateLink>
  )
}

interface NetworkConfigTemplateProps {
	children: ReactNode
  path: string
}
export function NetworkConfigTemplateLink (props: NetworkConfigTemplateProps) {
  return (
    <ConfigTemplateLink
      path={getNetworkConfigTemplateLink(props.path)}
    >
      {props.children}
    </ConfigTemplateLink>
  )
}

interface VenueConfigTemplateProps {
	children: ReactNode
  path: string
}
export function VenueConfigTemplateLink (props: VenueConfigTemplateProps) {
  return (
    <ConfigTemplateLink
      path={getVenueConfigTemplateLink(props.path)}
    >
      {props.children}
    </ConfigTemplateLink>
  )
}