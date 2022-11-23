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
  const { showImg, showEye, showText, showColorPic } = newContent.props
  const width = (showImg===false&&showEye===false&&showText===false)?46:
    ((showEye === false && showText===false && showColorPic===false )||(
      showEye===false && showImg===false))?98:(showText===false&&showImg===false)?72:124
  return (
    <UI.Popover content={newContent}
      getPopupContainer={()=>document.getElementById('democontent') as HTMLElement}
      trigger='click'
      placement='leftTop'
      overlayClassName='uipopover'
      overlayInnerStyle={{ backgroundColor: 'var(--acx-neutrals-10)', height: 30, width }}
      visible={visible}
      onVisibleChange={(value) => {
        onVisibleChange(value)
        if(!value)setShowColorPicker(value)
      }}>
      {props.children}
    </UI.Popover>
  )
}

