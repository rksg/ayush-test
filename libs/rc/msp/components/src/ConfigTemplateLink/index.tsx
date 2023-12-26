import { ReactNode } from 'react'

import { ConfigTemplateType } from '@acx-ui/msp/utils'
import {
  PolicyDetailsLinkProps,
  PolicyOperation,
  PolicyRoutePathProps,
  PolicyType,
  getConfigTemplateLink,
  getPolicyDetailsLink,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { MspTenantLink } from '@acx-ui/react-router-dom'

interface ConfigTemplateLinkProps {
  children: ReactNode
  path: string
}
export function ConfigTemplateLink (props: ConfigTemplateLinkProps) {
  return (
    <MspTenantLink to={getConfigTemplateLink(props.path)}>
      {props.children}
    </MspTenantLink>
  )
}

interface PolicyConfigTemplateLinkProps extends PolicyRoutePathProps {
	children: ReactNode
}
export function PolicyConfigTemplateLink (props: PolicyConfigTemplateLinkProps) {
  const { children, ...rest } = props
  return (
    <ConfigTemplateLink path={getPolicyRoutePath(rest)}>
      {props.children}
    </ConfigTemplateLink>
  )
}

interface PolicyConfigTemplateDetailsLinkProps extends PolicyDetailsLinkProps {
	children: ReactNode
}
export function PolicyConfigTemplateDetailsLink (props: PolicyConfigTemplateDetailsLinkProps) {
  const { children, ...rest } = props
  return (
    <ConfigTemplateLink path={getPolicyDetailsLink(rest)}>
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
      return <ConfigTemplateLink path={`networks/wireless/${id}/network-details/venues`} children={name} />
  }
}
