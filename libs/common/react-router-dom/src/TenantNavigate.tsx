import { Navigate } from 'react-router-dom'

import { useTenantLink  } from './useTenantLink'

import type { NavigateProps } from 'react-router-dom'

/**
 * Generate \<a href\> link to current tenant in URL scope
 */
export function TenantNavigate (props: NavigateProps) {
  const to = useTenantLink(props.to)

  return <Navigate {...props} to={to} />
}
