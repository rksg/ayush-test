import { Navigate } from 'react-router-dom'

import { TenantType, useTenantLink  } from './useTenantLink'

import type { NavigateProps } from 'react-router-dom'

/**
 * Generate \<a href\> link to current tenant in URL scope
 */
export function TenantNavigate ({
  tenantType,
  ...props
}: NavigateProps & { tenantType?: TenantType }) {
  const to = useTenantLink(props.to, tenantType)

  return <Navigate {...props} to={to} />
}
