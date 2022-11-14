import { Link } from 'react-router-dom'

import { TenantType, useTenantLink  } from './useTenantLink'

import type { LinkProps } from 'react-router-dom'

/**
 * Generate \<a href\> link to current tenant in URL scope
 */
export function TenantLink ({
  tenantType,
  ...props
}: LinkProps & { tenantType?: TenantType }) {
  const to = useTenantLink(props.to, tenantType)

  return <Link {...props} to={to} />
}
