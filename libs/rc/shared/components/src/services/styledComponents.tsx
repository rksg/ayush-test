import { createGlobalStyle } from 'styled-components/macro'

export const toolTipClassName = 'rks-rc-table-class-tooltip-popover'

export const ToolTipStyle = createGlobalStyle`
  .${toolTipClassName} {
    .ant-table-thead>tr>th,.ant-table-tbody {
      background-color:var(--acx-primary-black);
      color:var(--acx-primary-white)
    }

    .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-tbody > tr > td.ant-table-cell-row-hover{
      background-color:var(--acx-neutrals-70) !important;
    }

    .ant-table-tbody > tr.ant-table-row {
      border-bottom: 1px solid var(--acx-primary-white);
    }
  }
`