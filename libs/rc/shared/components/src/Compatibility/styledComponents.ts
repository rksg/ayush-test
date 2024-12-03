import styled from 'styled-components/macro'

import { WarningCircleSolid, WarningTriangleSolid } from '@acx-ui/icons'

export const CompatibilityWarningCircleIcon = styled(WarningCircleSolid)`
  display: flex;
  display: -webkit-flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  height: 16px;
  width: 16px;
  fill: var(--acx-semantics-yellow-50);
  path:nth-child(2) {
    stroke: var(--acx-semantics-yellow-30);
  }
`

export const CompatibilityWarningTriangleIcon = styled(WarningTriangleSolid)`
  display: flex;
  display: -webkit-flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  height: 16px;
  width: 16px;
  path:nth-child(1) {
    fill: var(--acx-semantics-yellow-50);
  }
  path:nth-child(3) {
    stroke: var(--acx-semantics-orange-30);
  }
`

export const MinReqVersionTooltipWrapper= styled.div`
  padding: 10px 10px 0 10px;
  
  .title {
    font-weight: bold;
    color: white;
    padding-bottom: 5px;
  }

  .label {
    color: var(--acx-neutrals-40);
    padding-bottom: 5px;
  }
  
  .list {
    padding-bottom: 10px;
  }
`
export const ApInfoWrapper = styled.div`
  .label {
    color: #7F7F7F;
  }
`