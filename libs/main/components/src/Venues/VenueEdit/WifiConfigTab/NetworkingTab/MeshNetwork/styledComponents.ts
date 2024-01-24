import styled from 'styled-components'

export const MeshInfoBlock = styled.div`
  margin-bottom: var(--acx-descriptions-space);
  background-color: var(--acx-neutrals-10);
  width: 600px;
  padding-top: 10px;
  padding-right: 100px;

  ul li {
    padding-bottom: 10px;
  }
`

export const MeshSsidDiv = styled.div<{ labelWidth: string, isEditMode: boolean }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  ${props => props.isEditMode
    ? `grid-template-columns: ${props.labelWidth} 300px 60px 60px;`
    : `grid-template-columns: ${props.labelWidth} 300px 80px 45px;` }

  svg {
    margin-top: 8px;
  }
`

export const MeshPassphraseDiv = styled.div<{ labelWidth: string, isEditMode: boolean }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  ${props => props.isEditMode
    ? `grid-template-columns: ${props.labelWidth} 300px 80px 60px 60px;`
    : `grid-template-columns: ${props.labelWidth} 300px 80px 45px;` }

  svg {
    margin-top: 8px;
  }

  textarea {
    resize: none;
  }
`

export const ZeroTouchMeshDiv = styled.div<{ labelWidth: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.labelWidth} 40px 40px;

  svg {
    margin-top: 8px;
  }
`
export const ErrorMessageDiv = styled.div`
  color: var(--acx-semantics-red-60);
  font-size: var(--acx-body-4-font-size);
  lineHeight: var(--acx-body-4-line-height);
  padding-bottom: 10px;
`
