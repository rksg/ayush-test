import styled, { createGlobalStyle } from 'styled-components/macro'

import { EyeOpenSolid } from '@acx-ui/icons'

export const InfoMargin = styled.div`
  margin: 10px 10px;
`
export const InstancesMargin = styled.div`
  margin: 10px 0px;
`
export const toolTipClassName = 'qos-traffic-class-tooltip-popover'

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
export const EyeOpenSolidCustom = styled(EyeOpenSolid)`
  transform: scale(1.75);
  path:nth-child(1){
    stroke: currentColor;
  }
  path:nth-child(2){
    fill: currentColor;
  }
  path:nth-child(3){
    stroke: currentColor;
  }
`