import { CSSProperties } from 'react'

import { Tooltip as AntTooltip } from 'antd'
import styled                    from 'styled-components'

import {
  InformationOutlined,
  InformationSolid,
  QuestionMarkCircleOutlined,
  WarningCircleOutlined,
  WarningCircleSolid,
  WarningTriangleOutlined,
  WarningTriangleSolid
} from '@acx-ui/icons'

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
  isFilled?: boolean,
  isTriangle?: boolean
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

// eslint-disable-next-line max-len
const CustomWarningTriangleSolid = styled(WarningTriangleSolid)<{ $fillColor?: string, $strokeColor?: string }>`
  path:nth-child(1) {
    fill: ${props => props.$fillColor || '#333333'};
  }

  path:nth-child(3) {
    stroke: ${props => props.$strokeColor || '#333333'};
  }
`

Tooltip.Warning = function WarningTooltip (props: PredefinedTooltipProps) {
  const { iconStyle, isFilled=false, isTriangle=false, ...tooltipProps } = props
  const { color, borderColor } = iconStyle || {}
  const warningIcon = (isTriangle)
    ? (isFilled)
      ? <CustomWarningTriangleSolid $fillColor={color}
        $strokeColor={borderColor || color}
        {...(iconStyle && { style: iconStyle })}/>
      : <WarningTriangleOutlined {...(iconStyle && { style: iconStyle })}/>
    : (isFilled)
      ? <WarningCircleSolid {...(iconStyle && { style: iconStyle })}/>
      : <WarningCircleOutlined {...(iconStyle && { style: iconStyle })}/>

  return <Tooltip {...tooltipProps}>
    {warningIcon}
  </Tooltip>
}