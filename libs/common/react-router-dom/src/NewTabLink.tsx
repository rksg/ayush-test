import { Link } from 'react-router-dom'

import type { LinkProps } from 'react-router-dom'

export function NewTabLink ({ to, ...props }: LinkProps) {
  const blankProps = { target: '_blank', rel: 'noreferrer noopener' }
  return (typeof to === 'string' && to.startsWith('http'))
    ? <a href={to} {...blankProps}>{props.children}</a>
    : <Link to={to} {...blankProps} {...props} />
}
