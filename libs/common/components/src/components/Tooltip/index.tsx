import { Tooltip as AntdTooltip } from 'antd'
import { TooltipProps }           from 'antd/lib/tooltip'

export const Tooltip = (props: TooltipProps) => {
  return (
    <AntdTooltip
      {...props}
    />
  )
}
