import { Link } from 'react-router-dom'

import type { LinkProps } from 'react-router-dom'

interface NewLinkProps extends LinkProps {
  rel?: string;
}

export function NewTabLink ({ to, rel, ...props }: NewLinkProps) {
  const blankProps = { target: '_blank', rel: rel || 'noreferrer noopener' }
  return (typeof to === 'string' && to.startsWith('http'))
    ? <a href={to} {...blankProps}>{props.children}</a>
    : <Link to={to} {...blankProps} {...props} />
}
