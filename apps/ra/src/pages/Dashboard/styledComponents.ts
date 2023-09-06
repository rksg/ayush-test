import styled from 'styled-components/macro'

import { gridGap } from '@acx-ui/components'

export const Grid = styled.div`
  display: grid;
  grid-gap: ${gridGap}px;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
  grid-template-areas:
/* 1 */  "b1 c1 d1"
/* 2 */  "b1 c1 d1"
/* 3 */  "b1 c1 d1"
/* 4 */  "b2 c1 d1"
/* 5 */  "b2 c1 d1"
/* 6 */  "b2 c2 d2"
/* 7 */  "b2 c2 d2"
/* 8 */  "b3 c2 d2"
/* 9 */  "b3 c2 d2"
/* 10 */ "b3 c2 d2"
/* 11 */ "b3 c2 d2"
/* 12 */ "b3 c2 d2"
  ;
`
