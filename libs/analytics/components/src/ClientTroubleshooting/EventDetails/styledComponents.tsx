import styled from 'styled-components'

export const DetailsContainer = styled.dl`
  display: grid;
  grid-template-columns: 100px 1fr;
  grid-auto-flow: row;
  grid-gap: 0.8em 5px;
  font-size: 12px;
  line-height: 1.3;
  width: 100%;
  &:last-of-type {
    margin-bottom: 0;
  }
`

export const RowLabel = styled.dt`
  margin: 0;
  font-weight: 400;
`

export const RowValue = styled.dd`
  margin: 0;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
`
