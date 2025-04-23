import styled from 'styled-components'

import { WarningCircleSolid } from '@acx-ui/icons'

export const WarningCircleRed = styled(WarningCircleSolid)`
  path:nth-child(2) {
    fill: var(--acx-semantics-red-50);
    stroke: var(--acx-semantics-red-50);
  }
`