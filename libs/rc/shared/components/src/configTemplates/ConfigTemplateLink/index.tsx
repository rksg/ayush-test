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
  getPolicyRoutePath,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { LinkProps, MspTenantLink, Path, useLocation, useTenantLink } from '@acx-ui/react-router-dom'

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

// eslint-disable-next-line max-len
export function renderConfigTemplateDetailsLink (type: ConfigTemplateType, id: string, name: string, option: OptionProps = {}) {
  let activeTab = ''
  switch (type) {
    case ConfigTemplateType.RADIUS:
      // eslint-disable-next-line max-len
      return <PolicyConfigTemplateDetailsLink type={PolicyType.AAA} oper={PolicyOperation.DETAIL} policyId={id} children={name} />
    case ConfigTemplateType.NETWORK:
      activeTab = option[ConfigTemplateType.NETWORK]?.activeTab || 'venues'
      // eslint-disable-next-line max-len
      return <ConfigTemplateLink to={`networks/wireless/${id}/network-details/${activeTab}`} children={name} />
    case ConfigTemplateType.VENUE:
      activeTab = option[ConfigTemplateType.VENUE]?.activeTab || 'networks'
      // eslint-disable-next-line max-len
      return <ConfigTemplateLink to={`venues/${id}/venue-details/${activeTab}`} children={name} />
  }
}

export function useConfigTemplateTenantLink (to: string) {
  return useTenantLink(getConfigTemplatePath(to), 'v')
}

// eslint-disable-next-line max-len
export function usePathBasedOnConfigTemplate (regularPath: string, configTemplatePath?: string): Path {
  const { isTemplate } = useConfigTemplate()
  const baseEditPath = useTenantLink(regularPath)
  const baseConfigTemplateEditPath = useConfigTemplateTenantLink(configTemplatePath ?? regularPath)

  return isTemplate ? baseConfigTemplateEditPath : baseEditPath
}
