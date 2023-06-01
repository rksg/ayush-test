import styled from 'styled-components/macro'

import { Dropdown } from '@acx-ui/components'

export const OverlayContainer = styled(Dropdown.OverlayContainer)`
  height: 220px;
  overflow-y: scroll;
  table {
    cursor: default;
  }
`
export const ButtonTitleWrapper = styled.span`
  color: var(--acx-neutrals-60);
`
