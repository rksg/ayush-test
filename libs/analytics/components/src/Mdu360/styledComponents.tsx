import styled from 'styled-components'

const numberOfColumns = 2

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${numberOfColumns}, 1fr);
  grid-template-rows: minmax(180px, auto) repeat(3, 270px);
  grid-gap: var(--acx-content-vertical-space);
  margin-top: var(--acx-content-vertical-space);
`

export const FullWidthGridItem = styled.div`
  grid-column: span ${numberOfColumns};
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
