import styled from 'styled-components'

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, minmax(270px, 1fr));
  grid-gap: var(--acx-content-vertical-space);
  margin-top: var(--acx-content-vertical-space);
`

export const ContentSwitcherWrapper = styled.div<{
  height: number;
  width: number;
}>`
  display: block;
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  margin-top: -38px;
  padding-bottom: 10px
`
