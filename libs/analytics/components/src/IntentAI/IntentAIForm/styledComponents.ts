import styled from 'styled-components/macro'

import { AIDrivenRRM } from '@acx-ui/icons'

export const AIDrivenRRMIcon = styled(AIDrivenRRM)`
  width: 32px;
  height: 32px;
`

export const SideNotes = styled.div.attrs((props: { $pageHeaderY: number }) => props)`
  position: relative;
  min-height: calc(
    100vh -
    ${props => props.$pageHeaderY}px -
    var(--acx-steps-form-actions-vertical-space) * 2 -
    32px -
    var(--acx-content-horizontal-space)
  );
  border: 1px solid var(--acx-neutrals-25);
  border-radius: 4px;
  padding: 20px;
`
