import { NavLink } from 'react-router-dom'

import { useTenantLink  } from './useTenantLink'

import type { NavLinkProps } from 'react-router-dom'

export function TenantNavLink (props: NavLinkProps) {
  const to = useTenantLink(props.to)
  return <NavLink {...props} to={to} />
}
