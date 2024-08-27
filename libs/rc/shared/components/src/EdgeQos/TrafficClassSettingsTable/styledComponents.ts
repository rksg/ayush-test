import styled from 'styled-components/macro'

import { StarSolid } from '@acx-ui/icons'


export const StarSolidCustom = styled(StarSolid)`
  transform: scale(1.75);
  path:nth-child(1){
    stroke: currentColor;
  }
  path:nth-child(2){
    fill: currentColor;
  }
  path:nth-child(3){
    stroke: currentColor;
  }
`