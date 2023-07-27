import { Space } from 'antd'
import styled    from 'styled-components'

import { Button as acxButton }     from '@acx-ui/components'
import { ArrowsOut, BulbOutlined } from '@acx-ui/icons'

export const StyledSpace = styled(Space)`
  position: absolute;
  top: -34px;
  right: 0;
`
export const ArrowOutIcon = styled(ArrowsOut)``

export const Button = styled(acxButton)`
  border: none;
`
export const FloorPlanContainer = styled('div')`
  overflow: overlay;
  max-height: 460px
`
export const EpmtyFloorplanContainer = styled('div')`
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`

export const RogueApButton = styled(Button)`
 &:hover, &:visited {
  svg path {
    stroke: var(--acx-accents-orange-50) !important
  }
}
svg path {
  stroke: var(--acx-accents-blue-50) !important
}
`
export const BulbOutlinedIcon = styled(BulbOutlined)`
 path {
   stroke: var(--acx-accents-orange-50) !important
 }
`
