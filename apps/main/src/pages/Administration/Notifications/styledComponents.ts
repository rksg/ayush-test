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
  font-size: var(--acx-body-3-font-size);
  line-height: var(--acx-body-3-line-height);
  overflow: hidden;
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
`

export const Checkbox = styled(AntCheckbox)`
  padding-right: 5px;
`

export const AfterMsg = styled.div`
  color: var(--acx-neutrals-60);
  padding-bottom: var(--acx-content-vertical-space);
`

export const List = styled(AntList)`
  .ant-list-split .ant-list-item {
    border-bottom: 0px;
  }

  .ant-list-item {
    border-bottom: 0px;
  }
`

export const SectionTitle = styled.div`
  font-weight: var(--acx-subtitle-6-font-weight-bold);
  margin-top: var(--acx-descriptions-space);
`

export const FooterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
`

export const ButtonFooterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: nowrap;
  justify-content: space-between;
`
