import styled from 'styled-components/macro'

import { Dropdown } from '@acx-ui/components'

export const DropdownContainer = styled(Dropdown.OverlayContainer)`
  width: 234px;
  p {
    margin: 10px 0 0 0 !important;
  }
`

export const ExtraContainer = styled.div`
  border-bottom: 1px solid black;
  padding-bottom: 10px;
`

export const MuteTitle = styled(Dropdown.OverlayTitle)`
  padding-top: 10px;
`
