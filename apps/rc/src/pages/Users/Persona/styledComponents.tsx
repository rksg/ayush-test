
import { CSSProperties } from 'react'

import styled from 'styled-components/macro'

import { cssNumber, cssStr } from '@acx-ui/components'
import { Blocked }           from '@acx-ui/icons'

export const PersonaBlockedIcon = styled(Blocked)`
  path {
    stroke: var(--acx-semantics-red-50) !important;
  }
`

export const blockedTagStyle: CSSProperties = {
  color: cssStr('--acx-primary-black'),
  fontSize: cssNumber('--acx-body-5-font-size'),
  fontWeight: cssNumber('--acx-body-font-weight'),
  borderRadius: '4px'
}
