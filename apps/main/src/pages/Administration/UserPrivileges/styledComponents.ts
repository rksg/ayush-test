import { Checkbox, Space } from 'antd'
import styled              from 'styled-components/macro'

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
  grid-template-columns: 465px 48px 48px 48px 48px;
  grid-column-gap: 2px;
  align-items: baseline;
  padding: 0 20px 5px 12px;
  background-color: #F2F2F2;
  label {
    display: flex;
    justify-content: center;
  }
`
export const FieldLabelAttributes = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 465px 48px 48px 48px 48px;
  grid-template-rows: 40px;
  grid-column-gap: 2px;
  align-items: center;
  margin: 2px 2px 2px 16px;
  .grid-item {
    background-color: var(--acx-neutrals-30);
    height: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0;
  }
  .grid-item > .ant-input {
    width: 13px;
    margin: 13px 6px;
  }
  .grid-item.ant-form-item {
    justify-content: center;
  }
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
export const VenueList = styled.div`
  margin-left: 35px;
  padding-right: 5px;
  overflow: hidden;
 `
export const ExpanderTableWrapper = styled.div`
  .disabled-row {
    :active {
      pointer-events: none;
    }
    .ant-checkbox-inner {
      border-color: var(--acx-neutrals-50);
    }
    .ant-table-cell {
      color: var(--acx-neutrals-50);
    }
  }
  .ant-table-row-level-0 {
    background-color: var(--acx-neutrals-20);
    .ant-table-cell {
      background-color: var(--acx-neutrals-20);
    }
  } 
  .ant-table-row-level-1 {
    background-color: var(--acx-primary-white);
    .ant-table-cell {
      background-color: var(--acx-primary-white);
    }
  } 
  .ant-pro-table {
    width: 350px;
  }

  .expanded-row-hidden {
    display: none;
  }

`
export const SelectedCount = styled.div`
  line-height: 16px;
  padding: 10px 16px 10px 16px;
  font-size: var(--acx-body-4-font-size);
  background-color: var(--acx-accents-blue-10);
  margin-bottom: -36px;
  z-index: 10000;
`
export const PermissionCheckbox = styled(Checkbox)`
  .ant-checkbox {
    background-color: var(--acx-primary-white);
  }
`
export const PermissionTableWrapper = styled.div`
  padding-bottom: 80px;
  .grid-item.ant-form-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 0;
  }
  .ant-table-thead > tr > th {
    text-align: center;
  }
  .ant-table-tbody > tr.ant-table-row:hover > td,
  .ant-table-tbody > tr > td.ant-table-cell-row-hover {
    background-color: transparent;
  }
`
export const PermissionSummaryWrapper = styled.div`
  .ant-descriptions-item .ant-descriptions-item-label {
    color: var(--acx-primary-black);
  }
`
