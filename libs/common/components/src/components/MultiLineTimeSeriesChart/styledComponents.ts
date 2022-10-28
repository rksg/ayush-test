import styled from 'styled-components/macro'

import { ResetWrapper } from '../Chart/styledComponents'

export const Wrapper = styled(ResetWrapper)`
  svg {
    // special color code to target path of brush
    path[stroke="#123456"] {
      stroke-dasharray: 2;
      stroke: var(--acx-accents-blue-50);
      clip-path: inset(0 round 5px);
    }
  }
`
