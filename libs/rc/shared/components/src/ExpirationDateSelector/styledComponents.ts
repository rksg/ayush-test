import styled from 'styled-components'

export const FieldSpace = styled.div<{ columns: string }>`
  display: grid;
  grid-template-columns: ${props => props.columns};
  grid-column-gap: 20px;
  height: 45px;
`
