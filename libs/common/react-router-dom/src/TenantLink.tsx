import { Link } from 'react-router-dom'

import { OpsIds, ScopeKeys } from '@acx-ui/types'

import { TenantType, useTenantLink  } from './useTenantLink'

import type { LinkProps } from 'react-router-dom'

/**
 * Generate \<a href\> link to current tenant in URL scope
 */
export function TenantLink ({
  tenantType,
  rbacOpsId,
  scopeKey,
  ...props
}: LinkProps & { tenantType?: TenantType, scopeKey?: ScopeKeys, rbacOpsId?: OpsIds }) {
  const to = useTenantLink(props.to, tenantType)

  return <Link {...props} to={to} />
}
export const MspTenantLink = (props: LinkProps) => <TenantLink {...props} tenantType='v' />
