import { Button as AntButton } from 'antd'
import styled, { css }         from 'styled-components/macro'

import { CancelCircle } from '@acx-ui/icons'

export const CloseButton = styled(AntButton).attrs({
  icon: <CancelCircle />
})`
  border: none;
  box-shadow: none;
  &.ant-btn-icon-only {
    width: 16px;
    height: 16px;
    padding: 0;
    background-color: var(--acx-accents-blue-10);
  }
`

export const ActionButton = styled.button`
  border: none;
  box-shadow: none;
  padding: 0 6px;
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  font-weight: 600;
  background-color: transparent;
  color: var(--acx-accents-blue-50);
  cursor: pointer;
`

const tallStyle = css`
  .ant-pro-table .ant-table {
    &-thead > tr > th {
      font-size: var(--acx-subtitle-4-font-size);
      line-height: var(--acx-subtitle-4-line-height);
      font-weight: 600;
    }

    &-thead > tr:first-child > th[colspan] {
      padding-bottom: 3px;
      border-bottom: 0;
    }

    &-thead > tr:not(:first-child) > th {
      font-size: var(--acx-subtitle-5-font-size);
      line-height: var(--acx-subtitle-5-line-height);
      padding-top: 0;
    }

    &-tbody > tr > td {
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
    }

    &-tbody > tr.ant-table-row-selected > td {
      background: none;
    }
  }

  .ant-pro-table {
    &-alert { margin: 0px; }
    &-alert-info {
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
    }

    .ant-alert {
      padding: 10px 16px;
      background-color: var(--acx-accents-blue-10);
      border: var(--acx-accents-blue-10);
      height: 36px;
    }
    .ant-divider-vertical {
      border-left-color: var(--acx-neutrals-40);
    }
  }
`

const compactStyle = css`
  .ant-pro-table .ant-table {
    &-thead > tr > th {
      font-size: var(--acx-body-5-font-size);
      line-height: var(--acx-body-5-line-height);
      font-weight: 700;
      padding-top: 6px;
      padding-bottom: 6px;
    }

    &-tbody > tr > td {
      font-size: var(--acx-body-5-font-size);
      line-height: var(--acx-body-5-line-height);
      padding-top: 6px;
      padding-bottom: 6px;
      border-bottom: 0px;
    }
  }
`

const tooltipStyle = css`
  .ant-pro-table .ant-table {
    background-color: transparent;
    font-family: var(--acx-neutral-brand-font);

    &-thead > tr > th {
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
      font-weight: 400;
      padding: 6px;
      border-bottom: 0px;
    }

    &-tbody > tr > td:first-child {
      font-size: var(--acx-subtitle-5-font-size);
      line-height: var(--acx-subtitle-5-line-height);
      font-weight: 700;
      padding: 0px;
    }

    &-tbody > tr > td {
      font-size: var(--acx-subtitle-5-font-size);
      line-height: var(--acx-subtitle-5-line-height);
      padding: 6px;
      border-bottom: 0px;
    }

    .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-tbody > tr > td.ant-table-cell-row-hover {
      background: none;
    }
  }
`

const styles = {
  tall: tallStyle,
  compact: compactStyle,
  tooltip: tooltipStyle
}

/* eslint-disable max-len */
export const Wrapper = styled.div<{ $type: 'tall' | 'compact' | 'tooltip' }>`
  .ant-pro-table .ant-table {
    &-thead > tr > th {
      background: transparent;
      border-bottom: 1px solid var(--acx-neutrals-30);
      padding: 12px 8px;
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
      padding: 14px 8px;

      a {
        font-size: unset;
      }
    }

  }

  .ant-pro-card-body { padding: 0; }

  ${props => styles[props.$type]}
`
