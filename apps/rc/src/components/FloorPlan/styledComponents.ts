import { Space, Button as AntButton } from 'antd'
import styled                         from 'styled-components'

import { ArrowsOut } from '@acx-ui/icons'


export const StyledSpace = styled(Space)`
    position: absolute;
    top: -34px;
    right: 0;
`
export const ArrowOutIcon = styled(ArrowsOut)``

export const Button = styled(AntButton)`
  border: none;
  box-shadow: none;
  background: var(--acx-primary-white);
  padding: 0;
  &.ant-btn-icon-only {
    width: 16px;
    height: 16px;
  }
`