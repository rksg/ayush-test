import { Input, List as AntList }    from 'antd'
import styled, { createGlobalStyle } from 'styled-components/macro'

import { Select, Tabs as AcxTabs } from '@acx-ui/components'
import { ArrowChevronRight }       from '@acx-ui/icons'

export const ArrowChevronRightIcons = styled(ArrowChevronRight)`
  width: 16px;
  height: 16px;
  path {
    stroke: var(--acx-accents-blue-50);
  }
`
export const Wrapper = styled.div`
  &:hover {
    path {
      stroke: var(--acx-accents-blue-60);
    }
  }
`
export const MenuExpandArrow = styled(ArrowChevronRight)`
  width: 16px;
  height: 16px;
  margin: 0.3em;
`

export const DashboardSelectDropdown = createGlobalStyle`
  .dashboard-select-dropdown {
    .ant-select-item-option {
      display: flex;
      align-items: center;
      padding: 8px 32px 8px 12px !important;

      &.hasUpdated:after {
        content: '';
        display: inline-block;
        position: absolute;
        right: 14px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: var(--acx-semantics-red-50);
      }
    }
    .ant-select-item-option-content {
      position: relative;
      padding-left: 26px;
      svg {
        display: inline-block;
        position: absolute;
        top: 50%;
        bottom: 50%;
        left: 0;
        margin: auto;
        color: var(--acx-neutrals-70);
      }
    }
  }
`

/* eslint-disable max-len */
export const DashboardSelector = styled(Select)`
  margin-left: -10px;
  .ant-select-selector {
    background-color: transparent !important;
    border: 0 !important;
    padding: 0 !important;
    .ant-select-selection-item {
      padding-right: 35px;
      color: var(--acx-neutrals-100);
      font-size: var(--acx-subtitle-4-font-size);
      font-weight: var(--acx-subtitle-4-font-weight);
    }
  }
  .ant-select-arrow {
    pointer-events: none;
    top: calc(50% - 2px);
    span[role=img]::after {
      background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEwNF8yNTMzMSkiPgo8cGF0aCBkPSJNMy41IDYuNUw4IDExTDEyLjUgNi41IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTA0XzI1MzMxIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=) !important;
    }
  }
`

export const DashboardList = styled.div`
  margin: 4px 0 36px;
  &.dragging {
    .mark.move {
      opacity: 0 !important;
    }
  }
`

export const DashboardItem = styled.div`
  display: flex;
  align-items: center;
  height: 76px;
  padding: 0 16px 0 12px;
  border-radius: 8px;
  border: 1px solid var(--acx-neutrals-20);
  background: var(--acx-neutrals-10);
  margin-bottom: 8px;
  cursor: default;
  overflow: hidden;
  width: 100%;
  gap: 8px;

  &[draggable=true] {
    cursor: grab;
  }

  .mark {
    display: flex;
    align-items: center;

    &.star {
      color: var(--acx-accents-orange-50);
    }
    &.move {
      opacity: 0;
      transition: .2s;
      color: var(--acx-accents-orange-30);
    }
  }
  .info {
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .title {
    display: inline-flex;
    max-width: 100%;
    align-items: center;
    font-size: var(--acx-subtitle-4-font-size);
    line-height: var(--acx-subtitle-4-line-height);
    font-weight: var(--acx-subtitle-4-font-weight);
    color: var(--acx-neutrals-100);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    svg {
      margin-left: 8px;
      flex-shrink: 0;
      color: var(--acx-neutrals-70);
    }
    .name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
  .desp {
    display: flex;
    align-items: center;
    margin-top: 3px;
  }
  .count, .date, .author {
    display: inline-flex;
    vertical-align: middle;
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    margin-right: 10px;
    color: var(--acx-neutrals-70);
  }
  .author {
    overflow: hidden;
    span {
      display: inline-flex;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }
    svg {
      flex-shrink: 0;
    }
    .name {
      display: block;
    }
  }
  .action {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    button {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      background: transparent;
      justify-content: center;
      transition: .2s;
      &:hover {
        color: var( --acx-neutrals-70);
        background: var( --acx-neutrals-20);
        svg path {
          color: var( --acx-neutrals-70);
        }
      }
    }
    svg {
      width: 100%;
      path {
        color: var( --acx-neutrals-70);
      }
    }
  }
  &:hover {
    .mark.move {
      opacity: 1;
    }
  }
  &.dragged {
    border: 1px solid var(--acx-accents-orange-30);
    background: var(--acx-accents-orange-10);
    opacity: 0.92;
    .action {
      opacity: 0;
    }
    .mark.move {
      opacity: 1;
    }
  }
  &.dragging {
    border: 1px dashed var(--acx-accents-orange-30);
    background: rgba(254, 246, 237, 0.30);
    .info,
    .mark.move,
    .action {
      opacity: 0;
    }
  }
`

export const SearchInput = styled(Input)`
  border-radius: 4px;
  border: 1px solid var(--acx-neutrals-30);
  margin: 0 0 8px;
  padding: 4px 12px 4px 8px;
`

export const Tabs = styled(AcxTabs)`
  margin-top: 4px;
  .ant-tabs-nav {
    margin: 0px 0 12px !important;
  }
  .ant-tabs-nav-wrap {
    justify-content: center;
  }
`

export const CanvasListItem = styled(AntList.Item)`
  display: flex;
  height: 68px;
  border-radius: 8px;
  border: 1px solid var(--acx-neutrals-20) !important;
  background: var(--acx-neutrals-10);
  margin-bottom: 6px;
  padding: 12px 16px 12px 15px !important;
  .ant-checkbox-inner {
    background: var(--acx-primary-white);
  }

  .ant-checkbox-wrapper {
    overflow: hidden;  
  }

  .ant-checkbox + span {
    padding: 0 15px 0 12px;
    max-width: 100%;
  }

  .info {
    white-space: nowrap;
    overflow: hidden;
  }
  .title {
    display: inline-flex;
    max-width: 100%;
    font-size: var(--acx-subtitle-4-font-size);
    line-height: var(--acx-subtitle-4-line-height);
    font-weight: var(--acx-subtitle-4-font-weight);
    color: var(--acx-neutrals-100);
    margin-bottom: 4px;    
    align-items: center;
    svg {
      margin-left: 8px;
      flex-shrink: 0;
      color: var(--acx-neutrals-70);
    }
    .name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
  .desp {
    display: flex
  }
  .count, .date, .author {
    display: inline-flex;
    vertical-align: middle;
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    margin-right: 10px;
    color: var(--acx-neutrals-70);
  }
  .count {
    display: inline-block;
    margin-right: 0;
    &:after {
      display: inline-block;
      content: '';
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--acx-neutrals-70);
      margin: 0 6px;
      vertical-align: middle;
    }
  }
  .author {
    overflow: hidden;
    span {
      display: inline-flex;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }
    svg {
      flex-shrink: 0;
      margin-right: 4px;
    }
    .name {
      display: block;
    }
  }
  .action {
    display: inline-flex;
    align-items: center;
    button {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      background: transparent;
      justify-content: center;
      transition: .2s;
      &:hover {
        color: var( --acx-neutrals-70);
        background: var( --acx-neutrals-20);
        svg path {
          color: var( --acx-neutrals-70);
        }
      }
    }
    svg {
      width: 100%;
      path {
        color: var( --acx-neutrals-70);
      }
    }
  }
`
