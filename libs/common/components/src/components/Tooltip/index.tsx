import { Tooltip as AntTooltip } from 'antd'

import type { TooltipProps } from 'antd'

Tooltip.defaultProps = {
  ...AntTooltip.defaultProps,
  mouseEnterDelay: 0.5
}

function Tooltip ({ ...props }: TooltipProps) {
  return <AntTooltip {...props} />
}

export { Tooltip, TooltipProps }
