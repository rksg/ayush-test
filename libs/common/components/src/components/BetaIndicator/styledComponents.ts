import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { Size } from '@acx-ui/icons-new'

export const IconWrapper = styled(Space)<{ $size?: Size }>`
  display: flex;
  ${(props) => (props.$size === 'sm' ? `
    width: 16px;
    height: 16px;
  ` : `
    width: 24px;
    height: 24px;
  `)}

  svg {
    display: flex;
    margin: 0 !important;
    color: var(--acx-accents-orange-50);
  }
`
export const IndicatorWrapper = styled(Space)<{ $isMultiLinesText?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px !important;

  ${props => !props.$isMultiLinesText && `
    svg {
      position: relative;
      top: -4px;
    }
  `}
`