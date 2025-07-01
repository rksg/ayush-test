import styled from 'styled-components/macro'

export const FieldLabelDomain = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 100px 180px 150px;
  align-items: baseline;
`
export const ImagePreviewDark = styled.div<{ width: string, height: string }>`
  display: flex;
  align-items: center;
  background-color: var(--acx-primary-black);
  width: ${props => props.width};
  height: ${props => props.height}
`
export const ImagePreviewLight = styled.div<{ width: string, height: string }>`
  display: flex;
  align-items: center;
  background-color: var(--acx-neutrals-15);
  width: ${props => props.width};
  height: ${props => props.height}
`
