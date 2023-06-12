import { Tooltip as AntTooltip } from 'antd'

import { InformationOutlined, InformationSolid, QuestionMarkCircleOutlined } from '@acx-ui/icons'

import * as UI from './styledComponents'

import type { TooltipProps } from 'antd'

Tooltip.defaultProps = {
  ...AntTooltip.defaultProps,
  mouseEnterDelay: 0.5
}

function Tooltip ({ ...props }: TooltipProps) {
  return <>
    <UI.TooltipGlobalStyle />
    <AntTooltip {...props} />
  </>
}

export { Tooltip, TooltipProps }

type PredefinedTooltipProps = Omit<TooltipProps, 'children'>

Tooltip.Question = function QuestionTooltip (props: PredefinedTooltipProps) {
  return <Tooltip {...props}>
    <QuestionMarkCircleOutlined />
  </Tooltip>
}

Tooltip.Info = function InfoTooltip (props: PredefinedTooltipProps) {
  return <Tooltip {...props} >
    <InformationOutlined />
  </Tooltip>
}


Tooltip.InfoFilled = function InfoFilledTooltip (props: PredefinedTooltipProps) {
  return <Tooltip {...props} >
    <InformationSolid />
  </Tooltip>
}
