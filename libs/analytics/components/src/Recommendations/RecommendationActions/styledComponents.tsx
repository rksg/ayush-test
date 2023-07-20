import styled from 'styled-components'

import { Reload } from '@acx-ui/icons'

export const ActionWrapper = styled.span<{ $disabled?: boolean }>`
  ${props => props.$disabled
    ? `
      cursor: not-allowed;
      pointer-events: none;
      color: var(--acx-neutrals-50);
    `
    : `
      cursor: pointer;
      color: var(--acx-primary-black);
    `}
`

export const RevertIcon = styled(Reload)`
    height: 24px;
    width: 24px;
`