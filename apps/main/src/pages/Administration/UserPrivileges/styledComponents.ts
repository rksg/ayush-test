import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const Wrapper = styled(Space)`
  .ant-pro-table-list-toolbar-title {
    padding: 15px;
  }
`

export const TableTitleWrapper = styled(Space)`
  background-color: var(--acx-neutrals-15);
  padding: 12px;
  & h4.ant-typography, & h5.ant-typography {
    font-weight: var(--acx-subtitle-6-font-weight);
  }

  h5 {
    font-size: var(--acx-subtitle-6-font-size);
  }
`

export const FieldLabelPermission = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 425px 42px 48px 48px 48px;
  align-items: baseline;
  padding: 0 10px 0px 10px;
  // margin: 2px;
  background-color: #F2F2F2;
`
export const FieldLabelAttributes = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 402px 48px 48px 48px 48px 48px;
  align-items: baseline;
  padding: 10px;
  margin: 2px 2px 2px 20px;
  background-color: var(--acx-neutrals-30);
`
export const FieldLabel2Attributes = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 620px 48px 48px 48px 48px 48px;
  align-items: baseline;
  padding: 10px;
  margin: 2px 2px 2px 20px;
  background-color: var(--acx-neutrals-30);
`
