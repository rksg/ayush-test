import { useState } from 'react'

import * as UI from '../styledComponents'

export default function PortalPopover (props:{
  children: React.ReactElement,
  content: React.ReactElement,
  visible: boolean,
  onVisibleChange:(value:boolean)=>void
}) {
  const { visible, onVisibleChange, content } = props
  const [showColorPicker, setShowColorPicker]=useState(false)
  const newContent={ ...content, props: { ...content.props, showColorPicker, setShowColorPicker } }
  return (
    <UI.Popover content={newContent}
      getPopupContainer={()=>document.getElementById('democontent') as HTMLElement}
      trigger='click'
      placement='leftTop'
      overlayClassName='uipopover'
      overlayInnerStyle={{ backgroundColor: '#80ffff', height: 30 }}
      visible={visible}
      onVisibleChange={(value) => {
        onVisibleChange(value)
        if(!value)setShowColorPicker(value)
      }}>
      {props.children}
    </UI.Popover>
  )
}

