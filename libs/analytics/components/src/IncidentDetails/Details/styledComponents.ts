import AutoSizer from 'react-virtualized-auto-sizer'
import styled    from 'styled-components/macro'

import { Dropdown } from '@acx-ui/components'

export const FixedAutoSizer = styled(AutoSizer)`
  position: fixed;
`

export const MuteIncidentContainer = styled(Dropdown.OverlayContainer)`
  width: 234px;
  p {
    margin: 10px 0 0 0 !important;
  }
`
