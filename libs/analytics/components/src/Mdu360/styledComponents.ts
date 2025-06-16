import styled from 'styled-components'

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, minmax(270px, 1fr));
  grid-gap: var(--acx-content-vertical-space);
  margin-top: var(--acx-content-vertical-space);
`