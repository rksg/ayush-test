import styled from 'styled-components/macro'

import { TagsOutline, TagsSolid } from '@acx-ui/icons'

export const TagsOutlineIcon = styled(TagsOutline)`
  width: 12px;
  height: 14px;
  path {
    fill: var(--acx-primary-white);
  }
  position: absolute;
`

export const TagsSolidIcon = styled(TagsSolid)`
  width: 12px;
  height: 14px;
  path {
    fill: var(--acx-primary-white);
  }
  position: absolute;
`
export const PortSpan = styled.span`
  padding-left: 15px;
`
