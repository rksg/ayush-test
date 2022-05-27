import { NotificationSolid }                          from '@acx-ui/icons'
import { Badge, Button as AntButton}                 from 'antd'
import styled, { css }                               from 'styled-components/macro'

export const Button = styled(AntButton)`
  background-color: var(--acx-neutrals-70);
  border: none;
  margin: 0 6px;
  :last-of-type { margin-right: 0; }
`
const buttonIconStyle = css`
  height: 100%;
  fill: var(--acx-primary-white);
  stroke: var(--acx-neutrals-70);
`

export const NotificationIcon = styled(NotificationSolid)`
  ${buttonIconStyle}
  stroke: var(--acx-primary-white);
`

export const NotificationCounter = styled(Badge)`
  margin: 8px 6px 0px 0px;
  sup {
    padding: 0 3px;
    font-size: 10px;
  }
`
