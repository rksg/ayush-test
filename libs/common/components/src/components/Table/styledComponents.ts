import styled, { css } from 'styled-components/macro'

export const RotatedColumn = styled.div``

/* eslint-disable max-len */

const tallStyle = css`
  .ant-table {
    &-thead > tr > th {
      font-size: var(--acx-subtitle-4-font-size);
      line-height: var(--acx-subtitle-4-line-height);
      font-weight: 600;
    }

    &-tbody > tr > td {
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
    }
  }
`

const compactStyle = css`
  .ant-table {
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

const rotatedStyle = css`
  .ant-table {
    &-thead > tr > th {
      font-size: var(--acx-body-5-font-size);
      line-height: 1;
      font-weight: 400;
      border-bottom: 0px;
      vertical-align: unset;

      ${RotatedColumn},
      .ant-table-column-sorters {
        writing-mode: vertical-rl;
        flex-flow: row-reverse;
        margin: auto;
        max-height: min-content;
      }

      ${RotatedColumn},
      .ant-table-column-title { transform: rotate(180deg); }

      .ant-table-column-sorter {
        margin: 0 0 calc(var(--icon-size) / 2) 0;
        &-up {
          margin-bottom: 0px;
          margin-left: calc(var(--icon-size) / -2);
        }
        &-down {
          margin-top: 0px;
          margin-right: calc(var(--icon-size) / -2);
        }
      }
    }

    &-tbody > tr > td {
      font-size: var(--acx-body-5-font-size);
      line-height: var(--acx-body-5-line-height);
      text-align: center;
    }
  }
`

const styles = {
  tall: tallStyle,
  compact: compactStyle,
  rotated: rotatedStyle
}

/* eslint-disable max-len */
export const Wrapper = styled.div<{ $type: 'tall' | 'compact' | 'rotated' }>`
  .ant-table {
    &-thead > tr > th {
      background: transparent;
      border-bottom: 1px solid var(--acx-neutrals-30);
      padding-top: 11px;
      padding-bottom: 11px;
      &:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
        width: 0px;
      }

      &.ant-table-column-has-sorters { background: unset; }

      .ant-table-column-sorters { justify-content: left; }

      .ant-table-column-title { flex: unset; }

      .ant-table-column-sorter {
        --icon-size: 11px;

        display: flex;
        margin: 0 0 0 calc(var(--icon-size) / 2);

        &-up, &-down {
          visibility: hidden;
          &.active { visibility: visible; }
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

    &-tbody > tr > td {
      border-bottom: 1px solid var(--acx-neutrals-30);
      padding-top: 14px;
      padding-bottom: 14px;
    }
  }

  ${props => styles[props.$type]}
`
