import styled from 'styled-components/macro'

export const Grid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  grid-template-areas:
/* 1 */  "a1 b1 c1 d1"
/* 2 */  "a1 b1 c1 d1"
/* 3 */  "a1 b1 c1 d1"
/* 4 */  "a1 b2 c1 d1"
/* 5 */  "a1 b2 c1 d1"
/* 6 */  "a1 b2 c2 d2"
/* 7 */  "a1 b2 c2 d2"
/* 8 */  "a1 b3 c2 d2"
/* 9 */  "a1 b3 c2 d2"
/* 10 */ "a1 b3 c2 d2"
/* 11 */ "a1 b3 c2 d2"
/* 12 */ "a1 b3 c2 d2"
  ;
`
