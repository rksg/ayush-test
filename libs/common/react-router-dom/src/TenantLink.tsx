import { Link } from 'react-router-dom'

import { useTenantLink  } from './useTenantLink'

import type { LinkProps } from 'react-router-dom'

/**
 * Generate \<a href\> link to current tenant in URL scope
 */
export function TenantLink (props: LinkProps) {
  const to = useTenantLink(props.to)

  return <Link {...props} to={to} />
}
