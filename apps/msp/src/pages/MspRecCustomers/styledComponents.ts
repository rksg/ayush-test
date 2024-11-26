import styled, { css } from 'styled-components/macro'

const linkStyle = css`
  color:var(--acx-accents-blue-50);
  cursor:pointer;
  margin-left:15px;
  margin-bottom:10px;
  &:hover{
    color:var(--acx-accents-blue-50);
  }
`
export const FieldTextLink = styled.div`
  ${linkStyle}
`
export const AdminList = styled.div`
  font-size: var(--acx-body-4-font-size);
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
  grid-template-columns: 150px 320px 40px;
  align-items: baseline;
`
export const FieldLabelAdmins2 = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 470px 40px;
  grid-template-rows: 20px;
  align-items: baseline;
`
export const FieldLabelDelegations = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 135px 320px;
  align-items: flex-start;
  .ant-form-item {
    margin-bottom: 0px;
  }
  .ant-form-item-control-input {
    align-items: flex-start;
  }
`