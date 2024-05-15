import { Link } from 'react-router-dom'

import { EdgeScopes, SwitchScopes, WifiScopes } from '@acx-ui/types'

import { TenantType, useTenantLink  } from './useTenantLink'

import type { LinkProps } from 'react-router-dom'

/**
 * Generate \<a href\> link to current tenant in URL scope
 */
export function TenantLink ({
  tenantType,
  scopeKey,
  ...props
}: LinkProps & { tenantType?: TenantType, scopeKey?: (WifiScopes|SwitchScopes|EdgeScopes)[], }) {
  const to = useTenantLink(props.to, tenantType)

  return <Link {...props} to={to} />
}
export const MspTenantLink = (props: LinkProps) => <TenantLink {...props} tenantType='v' />
