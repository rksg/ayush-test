import { Tooltip as AntTooltip } from 'antd'

import type { TooltipProps } from 'antd'

Tooltip.defaultProps = {
  placement: 'topLeft'
}

export function Tooltip ({ title, placement, children }: TooltipProps) {
  return <AntTooltip
    title={title}
    placement={placement}
    mouseEnterDelay={0.5}
  >
    { children }
  </AntTooltip>
}
