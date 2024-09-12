import { Popover }          from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'

import * as UI from './styledComponents'

export interface PopOverProps {
  visible?: boolean
  onVisibleChange?: (v:boolean)=>void
  content: React.ReactNode
  children: React.ReactNode
  overlayInnerStyle?: React.CSSProperties
  placement?: TooltipPlacement
}

export function PopOver (props: PopOverProps) {
  const { visible, onVisibleChange, content, children, overlayInnerStyle, placement } = props
  return <Popover
    getPopupContainer={()=>document.getElementById('democontent') as HTMLElement}
    visible={visible}
    content={content}
    onVisibleChange={(v)=> {
      onVisibleChange?.(v)
    }}
    trigger='click'
    placement={placement}
    overlayClassName={UI.popoverClassName}
    overlayInnerStyle={overlayInnerStyle}
  >
    {children}
  </Popover>
}