import styled from 'styled-components'

import { NewTabLink, TenantLink } from '@acx-ui/react-router-dom'

export const TabNewTabLink = styled(NewTabLink)`
color: var(--acx-primary-black);
&:hover {
  color: var(--acx-accents-orange-50);
  text-decoration: none;
}
`

export const TabTenantLink = styled(TenantLink)`
  color: var(--acx-primary-black);
  &:hover {
    color: var(--acx-accents-orange-50);
    text-decoration: none;
  }
`
