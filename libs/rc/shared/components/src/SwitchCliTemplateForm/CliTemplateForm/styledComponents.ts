import {
  Collapse as AntCollapse,
  Divider as AntDivider,
  List,
  Space
} from 'antd'
import styled from 'styled-components/macro'
import 'codemirror/addon/hint/show-hint.css'

import { Tabs }          from '@acx-ui/components'
import {
  QuestionMarkCircleOutlined,
  WarningTriangleSolid
} from '@acx-ui/icons'

export const SelectionControlLayout = styled(Space)`
  display: flex;
  .ant-radio-button-wrapper {
    border-radius: 0;
    font-size: var(--acx-body-4-font-size);
    &:nth-child(2) {
      font-size: var(--acx-body-3-font-size);
    }
    &:nth-child(3) {
      font-size: var(--acx-body-2-font-size);
    }    
    span:nth-child(2) {
      display: block;
      margin: 0 !important;
      line-height: 24px;
      text-align: center;
    }
  }
  .ant-radio-group {
    border-radius: 0;
  }
  label {
    width: 24px;
    padding: 0;
  }
`

export const Divider = styled(AntDivider).attrs({ type: 'vertical' })`
  background: var(--acx-primary-black);
`

export const TabsLayout = styled(Tabs)`
  .ant-tabs-nav > .ant-tabs-nav-wrap > .ant-tabs-nav-list > .ant-tabs-tab {
    padding: 6px 8px 11px;
  }
`

export const QuestionMarkIcon = styled(QuestionMarkCircleOutlined)`
  display: block;
  width: 16px;
`

export const WarningTriangleSolidIcon = styled(WarningTriangleSolid)`
  width: 18px;
  path{
    &:first-child {
      fill: var(--acx-semantics-red-50);
    }
    &:nth-child(odd) {      
      stroke: var(--acx-semantics-red-50);
    }
  }
`

export const tooltip = styled('div')`
  font-weight: normal;
  p {
    margin-bottom: 0;
  }
  div {
    p:first-child {
      font-weight: 600;
    }
  }
  strong {
    font-weight: 600;
    color: var(--acx-accents-orange-50);
  }
`

export const ExampleList = styled(List)`
  max-height: 430px;
  overflow-y: auto;
  .ant-list-items {
    .ant-list-item {
      cursor: default;
      padding: 10px 4px;
      color: var(--acx-accents-blue-50);
      border-bottom: 1px solid var(--acx-neutrals-50);
      &:last-child {
        border: 0;
      }
    }
  }
`

export const VariableList = styled(List)`
  max-height: 405px;
  margin-top: 5px;
  overflow-y: auto;
  .ant-list-items {
    .ant-list-item {
      align-items: flex-start;
      padding: 10px 4px;
    }
    .ant-list-item-action {
      display: flex;
      align-items: center;
      margin-left: 0;
      li {
        padding: 0;
      }
      .ant-list-item-action-split {
        display: none;
      }
    }
  }
`

export const VariableTypeLabel = styled(Space)`
  font-size: 11px;
  color: var(--acx-primary-white);
  border-radius: 20px;
  padding: 2px 8px;
`

export const VariableTitle = styled('div')`
  font-size: 10px;
  color: var(--acx-neutrals-60);
  line-height: 16px;
`

export const VariableContent = styled('div')`
  font-size: 12px;
  color: var(--acx-primary-black);
  margin-bottom: 6px;
  line-height: 16px;
`

export const CliVariableContent = styled('span')`
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export const CustomizedSection = styled('div')`
  background: var(--acx-neutrals-10);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`

export const CodeMirrorContainer = styled('div')`
  .CodeMirror {
    font-family: var(--acx-neutral-brand-font);
    font-size: var(--acx-body-3-font-size);
    background: var(--acx-neutrals-15);
    padding: 11px 38px 0 8px;
  }
`

export const Collapse = styled(AntCollapse)`
  .ant-collapse-item .ant-collapse-header {
    align-items: center;
    .ant-collapse-expand-icon {
      display: flex;
      svg {
        width: 17px;
        path {
          stroke: var(--acx-accents-blue-50);
        }
      }
    }
    .ant-collapse-header-text {
      width: 100%;
      > .ant-space {
        display: grid;
        grid-template-columns: 325px 1fr;
      }
    }
  }
`

export const ToggleWrapper = styled('div')`
  margin-bottom: 10px;
`