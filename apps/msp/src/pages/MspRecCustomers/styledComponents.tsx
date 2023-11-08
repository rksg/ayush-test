import styled, { css } from 'styled-components/macro'

const linkStyle = css`
  color:var(--acx-accents-blue-50);
  cursor:pointer;
  margin-bottom:10px;
  &:hover{
    color:var(--acx-accents-blue-50);
  }
`
export const FieldTextLink = styled.div`
  ${linkStyle}
`
export const AdminList = styled.div`
  padding-right: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
 `
export const FieldLabel2 = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 150px 150px;
  align-items: baseline;
`
export const FieldLabelAdmins = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 150px 280px 40px;
  align-items: baseline;
`