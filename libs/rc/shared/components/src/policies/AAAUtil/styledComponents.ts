import styled from 'styled-components/macro'

import { WarningCircleSolid } from '@acx-ui/icons'

export const toolTipClassName = 'radsec-tooltip'

export const WarningCircleRed = styled(WarningCircleSolid)`
  path:nth-child(2) {
    fill: var(--acx-semantics-red-60);
    stroke: var(--acx-primary-white);
  }
  path:nth-child(3) {
    stroke-width: 2px;
    stroke: var(--acx-primary-white);
  }
  path:nth-child(4) {
    stroke: var(--acx-primary-white);
  }
`