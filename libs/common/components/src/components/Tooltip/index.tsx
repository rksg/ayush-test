import { CSSProperties } from 'react'

import { Tooltip as AntTooltip } from 'antd'

import { InformationOutlined, InformationSolid, QuestionMarkCircleOutlined } from '@acx-ui/icons'

import { TooltipGlobalStyle, Disabled } from './styledComponents'

import type { TooltipProps as AntTooltipProps } from 'antd'

Tooltip.defaultProps = {
  ...AntTooltip.defaultProps,
  mouseEnterDelay: 0.5
}

type TooltipProps = AntTooltipProps & { disabled?: boolean }

function Tooltip ({ disabled, ...props }: TooltipProps) {
  let children = props.children
  if (disabled) children = <Disabled children={children} />
  return <>
    <TooltipGlobalStyle />
    <AntTooltip {...props} children={children} />
  </>
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
  return <Tooltip {...tooltipProps} >
    {!isFilled
      ? <InformationOutlined {...(iconStyle && { style: iconStyle })} />
      : <InformationSolid {...(iconStyle && { style: iconStyle })} />
    }
  </Tooltip>
}
