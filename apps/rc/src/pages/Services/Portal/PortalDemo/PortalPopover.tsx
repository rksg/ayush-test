import * as UI from '../styledComponents'

export default function PortalPopover (props:{
  children: React.ReactElement,
  content: React.ReactElement,
  visible: boolean,
  onVisibleChange:(value:boolean)=>void
}) {
  const { visible, onVisibleChange, content } = props
  return (
    <UI.Popover content={content}
      trigger='click'
      placement='leftTop'
      overlayClassName='uipopover'
      overlayInnerStyle={{ backgroundColor: '#80ffff', height: 30 }}
      visible={visible}
      onVisibleChange={(value) => onVisibleChange(value)}>
      {props.children}
    </UI.Popover>
  )
}

