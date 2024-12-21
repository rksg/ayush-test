import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const WebhookFormWrapper = styled.div`
  .ant-tabs-tab {
    font-size: 12px;
  }
  .ant-tabs-top > .ant-tabs-nav > .ant-tabs-nav-wrap
  > .ant-tabs-nav-list > .ant-tabs-tab + .ant-tabs-tab {
    margin-left: 16px;
  }
`
export const SubCheckboxWrapper = styled.div`
  display: grid;
  grid-template-columns: 180px;
  grid-row-gap: 7px;
  padding: 7px;
  .ant-checkbox-wrapper {
    margin-left: 16px;
  }
  .ant-tree-switcher, .ant-tree .ant-tree-node-content-wrapper {
    pointer-events: none;
  }
`
export const WebhookCheckboxWrapper = styled.div`
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
export const WebhookURLSpaceWrapper = styled(Space)`
  display: flex;
  .ant-space-item:nth-child(1){
    width: -webkit-fill-available;
  }
`
