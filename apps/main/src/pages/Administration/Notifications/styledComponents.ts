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
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
  gap: 20px;
`

export const AfterMsg = styled.div`
  color: var(--acx-neutrals-60);
  padding-bottom: var(--acx-content-vertical-space);
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
  gap: 100%;
`
export const NotificationFormWrapper = styled.div`
  .ant-tabs-tab {
    font-size: 12px;
  }
  .ant-tabs-top > .ant-tabs-nav > .ant-tabs-nav-wrap
  > .ant-tabs-nav-list > .ant-tabs-tab + .ant-tabs-tab {
    margin-left: 16px;
  }
`
export const NotificationCheckboxWrapper = styled.div`
  .ant-tree-switcher, .ant-tree .ant-tree-node-content-wrapper {
    pointer-events: none;
  }
  div.ant-tree-list-holder-inner {
    display: block !important;
  }
  .multi-col > .ant-tree-list {
    column-count: 2;
  }
  div.ant-tree-treenode.ant-tree-treenode-switcher-open {
    margin-top: 10px;
    column-span: all;
  }
`
export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.width} 1fr;
`
export const PhoneInputWrapper = styled.div`
  .ant-form-item {
    margin-bottom: 0px;
  }
`