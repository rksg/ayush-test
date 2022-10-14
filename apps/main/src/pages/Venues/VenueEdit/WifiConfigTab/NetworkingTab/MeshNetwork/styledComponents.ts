import styled from 'styled-components/macro'

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.width} 1fr;
`