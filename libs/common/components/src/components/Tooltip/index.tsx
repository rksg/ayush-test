import { CSSProperties } from 'react'

import { Tooltip as AntTooltip } from 'antd'

import { InformationOutlined, InformationSolid, QuestionMarkCircleOutlined } from '@acx-ui/icons'

import * as UI from './styledComponents'

import type { TooltipProps } from 'antd'

Tooltip.defaultProps = {
  ...AntTooltip.defaultProps,
  mouseEnterDelay: 0.5
}

type ExtendedTooltipProps = TooltipProps & {
  dottedUnderline?: boolean
}

function Tooltip (props: ExtendedTooltipProps) {
  let tooltip = <>
    <UI.TooltipGlobalStyle />
    <AntTooltip {...props} />
  </>
  if (props.dottedUnderline) {
    tooltip = <UI.TooltipWrapper>
      {tooltip}
    </UI.TooltipWrapper>
  }
  return tooltip
}

export { Tooltip, TooltipProps }

type PredefinedTooltipProps = Omit<TooltipProps, 'children'> & {
  iconStyle?: CSSProperties,
  isFilled?: boolean
}

Tooltip.Question = function QuestionTooltip (props: PredefinedTooltipProps) {
  const { iconStyle, ...tooltipProps } = props
  return <Tooltip {...tooltipProps}>
    <QuestionMarkCircleOutlined {...(iconStyle && { style: iconStyle })}/>
  </Tooltip>
}

Tooltip.Info = function InfoTooltip (props: PredefinedTooltipProps) {
  const { iconStyle, isFilled=false, ...tooltipProps } = props
  return <Tooltip {...tooltipProps}>
    {!isFilled
      ? <InformationOutlined {...(iconStyle && { style: iconStyle })} />
      : <InformationSolid {...(iconStyle && { style: iconStyle })} />
    }
  </Tooltip>
}
