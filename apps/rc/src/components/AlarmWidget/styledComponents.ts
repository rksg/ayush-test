import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { CheckMarkCircleSolid } from '@acx-ui/icons'

export const NoDataWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

export const GreenTickIcon = styled(CheckMarkCircleSolid)`
  height: 32px;
  width: 32px;
`

export const TextWrapper = styled(Space)`
  justify-content: center;
  width: 100%;
`
