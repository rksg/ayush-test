import styled from 'styled-components/macro'

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 34px;
  grid-template-columns: ${props => props.width} 1fr;
`

export const ClientAdmissionControlSliderBlock = styled.div`
  border-radius: 4px;
  border: 1px solid var(--acx-neutrals-30);
  margin-top:-25px;
  height:auto;
  text-align:center;
  padding:25px 5px 10px 30px;
`