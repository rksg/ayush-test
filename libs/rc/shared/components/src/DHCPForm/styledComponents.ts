import styled, { createGlobalStyle } from 'styled-components/macro'

export const Diagram = styled.div`
  width: 358px;
  margin-top: 40px;
`

export const RadioDescription = styled.div`
  color: var(--acx-neutrals-50);
  margin-top: 4px;
`
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
