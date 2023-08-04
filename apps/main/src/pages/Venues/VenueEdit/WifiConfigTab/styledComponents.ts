import styled from 'styled-components/macro'

export const RadioDescription = styled.div`
  color: var(--acx-neutrals-50);
  margin-top: 4px;
`

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.width} 1fr;
  align-items: baseline;
`

export const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: [column-1] 150px [column-2] auto;
  margin: 10px;
`

export const ClientAdmissionControlSliderBlock = styled.div`
  margin-top:-25px;
  margin-right: 50px;
  height:auto;
  max-width:100%;
  text-align:center;
  padding:25px 5px 10px 20px;
  border: 2px solid var(--acx-neutrals-30);
`