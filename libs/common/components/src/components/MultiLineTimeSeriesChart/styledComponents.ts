import styled from 'styled-components/macro'

import { Button } from '../Button'

export const Wrapper = styled.div`
  position: relative;
  width: fit-content;

  svg {
    // special color code to target path of brush
    path[stroke="#123456"] {
      stroke-dasharray: 2;
      stroke: var(--acx-accents-blue-50);
      clip-path: inset(0 round 5px);
    }
  }
`

export const ResetButton = styled(Button)`
  position: absolute;
  top: 15%;
  right: 0;
`
