import styled, { createGlobalStyle } from 'styled-components/macro'

import { Select }            from '@acx-ui/components'
import { ArrowChevronRight } from '@acx-ui/icons'

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
      &.default {
        .ant-select-item-option-content {
          padding-left: 0;
        }
      }
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
      }
    }
  }
`

/* eslint-disable max-len */
export const DashboardSelector = styled(Select)`
  margin-left: -10px;
  .ant-select-selector {
    min-width: 240px;
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