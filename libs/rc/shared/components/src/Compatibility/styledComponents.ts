import styled from 'styled-components/macro'

import { WarningCircleSolid } from '@acx-ui/icons'

export const CompatibilityWarningCircleIcon = styled(WarningCircleSolid)`
  height: 16px;
  width: 16px;
  fill: var(--acx-semantics-yellow-50);
  path:nth-child(2) {
    stroke: var(--acx-semantics-yellow-30);
  }
`