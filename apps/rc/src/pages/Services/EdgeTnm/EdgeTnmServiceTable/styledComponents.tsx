import styled, { css } from 'styled-components/macro'

import {
  CheckMarkCircleSolid,
  Unknown,
  MinusCircleSolid,
  InProgress
} from '@acx-ui/icons'

const iconStyle = css`
  width: 16px;
  height: 16px;
  margin-bottom: -3px;
`
export const CheckMarkCircleSolidIcon = styled(CheckMarkCircleSolid)`
  ${iconStyle}
`

export const UnknownIcon = styled(Unknown)`
  ${iconStyle}
`

export const UnavailableIcon = styled(MinusCircleSolid)`
  ${iconStyle}
  path:nth-child(1) {
    fill: var(--acx-neutrals-50)
  }
  path:nth-child(2) {
    stroke: var(--acx-neutrals-50);
  }
`

export const CheckingIcon = styled(InProgress)`
  circle {
    fill: var(--acx-neutrals-50);
    stroke: var(--acx-neutrals-50);
  }
  width: 22px;
  height: 22px;
  transform: scale(0.8);
  vertical-align: middle;
`