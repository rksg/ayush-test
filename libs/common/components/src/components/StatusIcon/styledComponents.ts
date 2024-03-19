import styled from 'styled-components/macro'

import {
  CancelCircleSolid,
  CheckMarkCircleSolid,
  Pending,
  InProgress
}                         from '@acx-ui/icons'

export const SuccessIcon = styled(CheckMarkCircleSolid)`
path:nth-child(1) {
  fill: var(--acx-semantics-green-50);
}
path:nth-child(3) {
  stroke: var(--acx-semantics-green-50);
}
`
export const FailIcon = styled(CancelCircleSolid)`
  path:nth-child(1) {
    fill: var(--acx-semantics-red-50);
  }
  path:nth-child(2) {
    stroke: var(--acx-semantics-red-50);
  }
`
export const PendingsIcon = styled(Pending)`
  circle {
    fill: var(--acx-neutrals-60);
    stroke: var(--acx-neutrals-60);
  }
`
export const InProgressIcon = styled(InProgress)`
  circle {
    fill: var(--acx-neutrals-60);
    stroke: var(--acx-neutrals-60);
  }
`

export const Dash = styled.div`
  margin-left: 50px;
  border-left: 1px solid var(--acx-neutrals-50);
  height: 8px;
`
