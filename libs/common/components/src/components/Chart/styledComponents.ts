import { Badge as AntBadge } from 'antd'
import styled                from 'styled-components/macro'

import { Button } from '../Button'

export const TooltipWrapper = styled.div`
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  color: var(--acx-primary-white);
  max-width: 200px;
  white-space: normal;
  word-wrap: break-word;

  time { font-weight: var(--acx-body-font-weight-bold); }

  > ul {
    padding: 0px;
    margin: 0px;
    list-style-type: none;
    padding-top: 4px;
  }
  > li {
    font-weight: var(--acx-body-font-weight);
    margin-bottom: 4px;
    &:is(:last-child) { margin-bottom: unset; }
  }
`

export const Badge = styled(AntBadge)`
  .ant-badge-status-dot {
    height: 6px;
    width: 6px;
    top: unset;
  }
  .ant-badge-status-text {
    margin-left: 4px;
    font-family: var(--acx-neutral-brand-font);
    font-size: var(--acx-body-5-font-size);
    line-height: var(--acx-body-5-line-height);
    color: var(--acx-primary-white);
    b {
      font-weight: var(--acx-body-font-weight-bold);
    }
  }
`

export const ResetWrapper = styled.div`
  position: relative;
  width: fit-content;
`

interface ResetButtonProps {
  $disableLegend: boolean
}
export const ResetButton = styled(Button)<ResetButtonProps>`
  position: absolute;
  top: ${props => props.$disableLegend ? '6px' : '15%'};
  right: 0;
`
