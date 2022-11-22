import styled from 'styled-components'

export const FieldLabel = styled.div<{ columns: string }>`
  display: grid;
  grid-template-columns: ${props => props.columns};
  grid-column-gap: 10px;
  align-items: baseline;
`
