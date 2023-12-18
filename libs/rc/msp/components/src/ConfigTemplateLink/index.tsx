import { ReactNode } from 'react'

import {
  PolicyOperation,
  PolicyType,
  getConfigTemplateLink,
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

interface PolicyConfigTemplateProps {
	children: ReactNode
  type: PolicyType
  oper: PolicyOperation
}
export function PolicyConfigTemplateLink (props: PolicyConfigTemplateProps) {
  return (
    <ConfigTemplateLink path={getPolicyRoutePath({ type: props.type, oper: props.oper })}>
      {props.children}
    </ConfigTemplateLink>
  )
}
