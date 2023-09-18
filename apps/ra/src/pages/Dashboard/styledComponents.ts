import styled from 'styled-components/macro'

import { gridGap } from '@acx-ui/components'

export const Grid = styled.div`
  display: grid;
  grid-gap: ${gridGap}px;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  grid-template-areas:
/* 1 */  "a1 b1 b1 d1"
/* 2 */  "a1 b1 b1 d1"
/* 3 */  "a1 b1 b1 d1"
/* 4 */  "a2 b2 c1 d1"
/* 5 */  "a2 b2 c1 d1"
/* 6 */  "a2 b2 c1 d1"
/* 7 */  "a2 b2 c1 d1"
/* 8 */  "a2 b2 c1 d2"
/* 9 */  "a2 b2 c1 d2"
/* 10 */ "a2 b2 c1 d2"
/* 11 */ "a2 b2 c1 d2"
/* 12 */ "a2 b2 c1 d2"
  ;
`
