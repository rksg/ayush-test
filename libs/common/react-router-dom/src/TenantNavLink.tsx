import { NavLink } from 'react-router-dom'

import { TenantType, useTenantLink  } from './useTenantLink'

import type { NavLinkProps } from 'react-router-dom'

export function TenantNavLink ({
  tenantType,
  ...props
}: NavLinkProps & { tenantType?: TenantType }) {
  const to = useTenantLink(props.to, tenantType)
  return <NavLink {...props} to={to} />
}
