import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const IconWrapper = styled(Space)`
  display: flex;
  width: 16px;
  height: 16px;

  svg {
    display: flex;
    width: 16px !important;
    height: 16px !important;
    margin: 0 !important;
    color: var(--acx-accents-orange-50);
  }
`
export const IndicatorWrapper = styled(Space)`
  display: inline-flex;
  align-items: center;
  gap: 2px !important;
`