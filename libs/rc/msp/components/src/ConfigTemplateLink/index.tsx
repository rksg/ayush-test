import { ReactNode } from 'react'

import {
  ConfigTemplateType,
  LocationExtended,
  PolicyDetailsLinkProps,
  PolicyOperation,
  PolicyRoutePathProps,
  PolicyType,
  getConfigTemplatePath,
  getPolicyDetailsLink,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { LinkProps, MspTenantLink, useLocation } from '@acx-ui/react-router-dom'

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

// eslint-disable-next-line max-len
export function renderConfigTemplateDetailsLink (type: ConfigTemplateType, id: string, name: string) {
  switch (type) {
    case ConfigTemplateType.RADIUS:
      // eslint-disable-next-line max-len
      return <PolicyConfigTemplateDetailsLink type={PolicyType.AAA} oper={PolicyOperation.DETAIL} policyId={id} children={name} />
    case ConfigTemplateType.NETWORK:
      // eslint-disable-next-line max-len
      return <ConfigTemplateLink to={`networks/wireless/${id}/network-details/venues`} children={name} />
  }
}
