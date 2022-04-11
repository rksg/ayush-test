import styled from 'styled-components/macro'

/* eslint-disable max-len */
export const Wrapper = styled.div`
  .ant-table {
    &-thead > tr > th {
      font-size: var(--acx-subtitle-4-font-size);
      line-height: var(--acx-subtitle-4-line-height);
      background: transparent;
      font-weight: 600;
      border-bottom: 1px solid var(--acx-neutrals-30);
      padding-top: 11px;
      padding-bottom: 11px;

      &:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
        width: 0px;
      }
    }

    &-tbody {
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
      > tr > td {
        border-bottom: 1px solid var(--acx-neutrals-30);
      }
    }

    .ant-badge-status {
      vertical-align: middle;
    }
  }
`
