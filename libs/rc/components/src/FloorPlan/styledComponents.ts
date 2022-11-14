import { Space } from 'antd'
import styled    from 'styled-components'

import { Button as acxButton } from '@acx-ui/components'
import { ArrowsOut }           from '@acx-ui/icons'

export const StyledSpace = styled(Space)`
  position: absolute;
  top: -34px;
  right: 0;
`
export const ArrowOutIcon = styled(ArrowsOut)``

export const Button = styled(acxButton)`
  border: none;
  box-shadow: none;
  background: var(--acx-primary-white);
  padding: 0;
  &.ant-btn-icon-only {
    width: 16px;
    height: 16px;
  }
`
export const FloorPlanContainer = styled('div')`
  overflow: overlay;
  max-height: 460px
`
export const EpmtyFloorplanContainer = styled('div')`
  display: inline-flex;
  align-items: center;
  flex-direction: column
`