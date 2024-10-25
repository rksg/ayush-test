import { createGlobalStyle } from 'styled-components/macro'

export const toolTipClassName = 'rks-rc-table-class-tooltip-popover'

export const ToolTipStyle = createGlobalStyle`
  .${toolTipClassName} {
    .ant-table-thead > tr > th, 
    .ant-table-tbody,
    .ant-table-tbody > tr > td {
      background-color:var(--acx-primary-black);
      color:var(--acx-primary-white)
    }

    .ant-table-thead > tr > th.ant-table-column-has-sorters {
      & .ant-table-column-sorters span.ant-table-column-sorter {
        & span.ant-table-column-sorter-inner .anticon svg  {
          fill: var(--acx-primary-white)
        }
      }
    }

    .ant-table-thead > tr:hover > th.ant-table-cell,
    .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-tbody > tr > td.ant-table-cell-row-hover {
      background-color:var(--acx-neutrals-70) !important;
    }

    .ant-table-tbody > tr.ant-table-row {
      border-bottom: 1px solid var(--acx-primary-white);
    }
  }
`