import { createGlobalStyle } from 'styled-components/macro'

export const toolTipClassName = 'dhcp-tooltip-popover'

export const ToolTipStyle = createGlobalStyle`
  .${toolTipClassName} {
    .ant-table-thead>tr>th,.ant-table-tbody,
    .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-tbody > tr > td.ant-table-cell-row-hover{
      background-color:var(--acx-primary-black);
      color:var(--acx-primary-white)
    }
  }
`
