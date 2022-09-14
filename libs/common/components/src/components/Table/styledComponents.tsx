import {
  Button,
  Input,
  Select,
  Tooltip as AntTooltip
} from 'antd'
import styled, { css, createGlobalStyle } from 'styled-components/macro'

import { InformationOutlined, CancelCircle } from '@acx-ui/icons'

import { Subtitle } from '../Subtitle'

export const InformationTooltip = styled(AntTooltip).attrs({ children: <InformationOutlined /> })``

export const TitleWithTooltip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
`

export const SubTitle = styled.span`
  display: block;
  color: var(--acx-neutrals-70);
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
`

export const SearchInput = styled(Input)`
  .ant-input-suffix {
    right: 0;
  }
  ${({ value }) => value ? 'border-color: var(--acx-neutrals-70) !important;' : ''}
`

export const FilterSelect = styled(Select).attrs({ style: { width: 200 } })`
  ${({ value }) => value
    ? `.ant-select-selector {
      background-color: var(--acx-accents-orange-10) !important;
      border-color: var(--acx-neutrals-70) !important;
    }` : ''
}
`

export const CloseButton = styled(Button).attrs({ icon: <CancelCircle /> })`
  border: none;
  box-shadow: none;
  &.ant-btn-icon-only {
    width: 16px;
    height: 16px;
    padding: 0;
    background-color: var(--acx-accents-blue-10);
  }
`

export const ActionButton = styled.button.attrs({ type: 'button' })`
  border: none;
  box-shadow: none;
  padding: 0 6px;
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
  background-color: transparent;
  color: var(--acx-accents-blue-50);
  cursor: pointer;
`

export const TableSettingTitle = styled(Subtitle).attrs({ level: 5 })``

export const TableSettingsGlobalOverride = createGlobalStyle`
  .ant-pro-table-column-setting {
    &-overlay {
      .ant-popover-inner {
        padding-bottom: 48px;
      }
      .ant-popover-title {
        min-height: unset;
        padding: 16px 24px;
        padding-bottom: 8px;
        border-bottom: 0;
      }
      .ant-popover-inner-content {
        padding-bottom: 8px;
        border-bottom: 1px solid var(--acx-neutrals-20);
      }
      .ant-tree-switcher { display: none; }
      .ant-tree-treenode-disabled {
        .ant-tree-draggable-icon { visibility: hidden; }
      }
      .ant-tree-treenode {
        padding: 4px 0;
        align-items: center;
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
        font-weight: var(--acx-body-font-weight);
        &:hover { background-color: unset; }
        .ant-tree-checkbox { margin-left: 24px; }
        .ant-tree-draggable-icon ~ .ant-tree-checkbox { margin-left: 0; }
      }
      .ant-tree:last-of-type {
        display: none;
      }
      // prevent subtitle to appear in column setting
      ${SubTitle} { display: none; }
    }

    &-title {
      height: unset;
      .ant-checkbox-wrapper { display: none; }
      .ant-btn {
        position: absolute;
        left: 16px;
        bottom: 13px;
      }
      h5${TableSettingTitle} {
        margin-bottom: 0;
      }
    }

    &-list-title,
    &-list-item-option {
      display: none !important;
    }
  }
`

const actionsHeight = '36px'

type StyledTable = {
  $type: 'tall' | 'compact' | 'tooltip'
  $rowSelectionActive: boolean
}

/* eslint-disable max-len */
const tallStyle = css<StyledTable>`
  .ant-pro-table {
    ${props => props.$rowSelectionActive && css`
      .ant-table-wrapper {
        padding-top: ${actionsHeight};
      }
    `}

    .ant-table {

      &-thead > tr:last-child > th,
      &-thead > tr:first-child > th[rowspan] {
        &:not(.ant-table-selection-column):not(.ant-table-cell-fix-right) {
          &:hover {
            background: var(--acx-accents-orange-10);
            border-color: var(--acx-accents-orange-30);
          }
          .react-resizable-handle {
            display: block;
            position: absolute;
            right: -10px;
            bottom: 0;
            z-index: 1;
            width: 20px;
            height: 100%;
            cursor: col-resize;
          }
        }
      }

      &-thead > tr:last-child > th,
      &-thead > tr:first-child > th[rowspan],
      &-thead > tr > th,
      &-tbody > tr > td {
        border-width: 0 1px 1px;
        border-style: solid;
        border-color: transparent;
      }
      &-thead > tr > th {
        -webkit-user-select: none;
        .react-resizable-handle {
            display: none;
        }
      }

      &-thead > tr:last-child,
      &-tbody > tr {
        position: relative;
        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 1px;
          left: 0;
          bottom: 0;
          background-color: var(--acx-neutrals-30);
          z-index: 2;
        }
      }
    }

    &-list-toolbar {
      &-container { padding: 0; }
      &-right {
        // setting to 0 due to empty toolbar still take up space
        // need to revisit this if we intend to use toolbar for other usage
        height: 0;
      }
      &-setting-items .ant-space-item:last-child {
        position: absolute;
        right: 0;
        z-index: 3;
        top: ${props => props.$rowSelectionActive ? `calc(11px + ${actionsHeight})` : '11px' };
      }
    }

    &-alert {
      margin: 0px;
      position: absolute;
      left: 0;
      right: 0;

      .ant-alert {
        height: ${actionsHeight};
        background-color: var(--acx-accents-blue-10);
        border: var(--acx-accents-blue-10);
        padding: 10px 16px;

        .ant-pro-table-alert-info {
          font-size: var(--acx-body-4-font-size);
          line-height: var(--acx-body-4-line-height);

          .ant-divider-vertical {
            border-left-color: var(--acx-neutrals-40);
          }
        }
      }
    }
  }
`

const compactStyle = css`
  .ant-pro-table {
    .ant-table {
      &-thead > tr:first-child > th,
      &-thead > tr:last-child > th {
        font-size: var(--acx-body-5-font-size);
        line-height: var(--acx-body-5-line-height);
        font-weight: var(--acx-body-font-weight-bold);
        padding-top: 6px;
        padding-bottom: 6px;
      }

      &-tbody > tr > td {
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
        font-weight: var(--acx-body-font-weight);
        padding-top: 6px;
        padding-bottom: 6px;
        border-bottom: 0px;
      }
    }
  }
`

const tooltipStyle = css`
  .ant-pro-table {
    .ant-table {
      background-color: transparent;

      &-thead > tr:first-child > th,
      &-thead > tr:last-child > th {
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
        font-weight: var(--acx-body-font-weight);
        padding: 6px;
        border-bottom: 0px;
      }

      &-tbody > tr > td:first-child {
        font-size: var(--acx-subtitle-5-font-size);
        line-height: var(--acx-subtitle-5-line-height);
        font-weight: var(--acx-subtitle-5-font-weight);
        padding: 0px;
      }

      &-tbody > tr > td {
        font-size: var(--acx-subtitle-5-font-size);
        line-height: var(--acx-subtitle-5-line-height);
        padding: 6px;
        border-bottom: 0px;
      }
    }
  }
`

const styles = {
  tall: tallStyle,
  compact: compactStyle,
  tooltip: tooltipStyle
}

export const Header = styled.div`
  height: ${actionsHeight};
  display: flex;
  justify-content: space-between;
`
export const HeaderRight = styled.div`
  text-align: right;
`

export const Wrapper = styled.div<StyledTable>`
  .ant-pro-table {
    --acx-table-cell-horizontal-space: 8px;

    .ant-pro-card {
      .ant-pro-card-body {
        padding: 0px;
      }
    }

    .ant-table {
      &-cell-fix-left {
        border-bottom: 1px solid var(--acx-neutrals-30) !important;
      }

      &-thead > tr:first-child > th {
        padding-top: 12px;
        font-size: var(--acx-subtitle-4-font-size);
        line-height: var(--acx-subtitle-4-line-height);
        font-weight: var(--acx-subtitle-4-font-weight);
      }

      &-thead > tr:not(:first-child) > th {
        padding-top: 6px;
        font-size: var(--acx-subtitle-5-font-size);
        line-height: var(--acx-subtitle-5-line-height);
        font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
      }

      &-thead > tr:last-child > th,
      &-thead > tr:first-child > th[rowspan] {
        padding-bottom: 12px;
        border-bottom: 1px solid var(--acx-neutrals-30);
      }

      &-thead > tr > th {
        border-bottom: 0;
        padding: 0px var(--acx-table-cell-horizontal-space);
        &:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
          width: 0px;
        }

        &.ant-table-column-has-sorters {
          background: unset;

          .ant-table-column-sorters {
            display: unset;
            white-space: nowrap;

            .ant-table-column-title { flex: unset; }

            .ant-table-column-sorter {
              --icon-size: 11px;

              display: inline-flex;
              margin: 0;

              &-up, &-down {
                visibility: hidden;
                width: 0;
                &.active {
                  visibility: visible;
                  width: unset;
                  margin-left: calc(var(--icon-size) / 2);
                }
              }
              &-up {
                margin-bottom: calc(var(--icon-size) / -2);
              }
              &-down {
                margin-top: calc(var(--icon-size) / -2);
              }

              .anticon svg { fill: var(--acx-primary-black); }
            }
          }
        }
      }

      &-tbody > tr > td {
        border-bottom: 1px solid var(--acx-neutrals-30);
        padding: 14px var(--acx-table-cell-horizontal-space);
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);

        a {
          font-size: unset;
        }
      }
    }
  }

  ${props => styles[props.$type]}
`
