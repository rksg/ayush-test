import styled from 'styled-components/macro'

export const FieldLabel = styled.div<{ width: string }>`
  display: grid;
  line-height: 32px;
  color: #808284;
  grid-template-columns: ${props => props.width} 1fr;
`

export const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: 34px;
`
