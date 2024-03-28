import { Space } from 'antd'
import styled    from 'styled-components'

import { Reload } from '@acx-ui/icons'

export const Actions = styled(Space)`
  .ant-picker-suffix {
    margin: 0 !important;
  }
`

export const IconWrapper = styled.span<{ $disabled?: boolean }>`
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
export const ActionsText = styled.span`
    cursor: pointer;
    color: var(--acx-accents-blue-50);
    font-size: 12px !important;
`

export const RevertIcon = styled(Reload)`
    height: 24px;
    width: 24px;
`
