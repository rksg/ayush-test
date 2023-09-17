import {
  Checkbox as AntCheckbox,
  List as AntList
} from 'antd'
import styled, { css } from 'styled-components/macro'


export const Wrapper = styled.div`
  .description {
    padding: 12px;
    background-color: var(--acx-neutrals-15);
  }

  .ant-table-tbody > tr > td.ant-table-cell {
    word-break: break-word;
  }
`

export const Spacer = styled.div`
  height: var(--acx-descriptions-space);
`

export const dialogStyles = css`
  .email_mobile_help .ant-form-item-control {
    display: none;
  }
`

export const IncidentNotificationWrapper = styled.div`
  padding-top: var(--acx-content-vertical-space);
`

export const Checkbox = styled(AntCheckbox)`
  padding-right: 5px;
`

export const AfterMsg = styled.div`
  color: var(--acx-neutrals-60);
`

export const List = styled(AntList)`
  .ant-list-split .ant-list-item {
    border-bottom: 0px;
  }

  .ant-list-item {
    border-bottom: 0px;
  }
`
