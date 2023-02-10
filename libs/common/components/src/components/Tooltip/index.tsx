import { Tooltip as AntTooltip } from 'antd'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

import type { TooltipProps } from 'antd'

Tooltip.defaultProps = {
  ...AntTooltip.defaultProps,
  mouseEnterDelay: 0.5
}

function Tooltip ({ ...props }: TooltipProps) {
  return <AntTooltip {...props} />
}

export { Tooltip, TooltipProps }

type PredefinedTooltipProps = Omit<TooltipProps, 'children'>

Tooltip.Question = function QuestionTooltip (props: PredefinedTooltipProps) {
  return <Tooltip {...props}>
    <QuestionMarkCircleOutlined />
  </Tooltip>
}
