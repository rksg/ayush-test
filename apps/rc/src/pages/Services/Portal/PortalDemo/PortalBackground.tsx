
import { useState } from 'react'

import { Upload }       from 'antd'
import { RcFile }       from 'antd/lib/upload'
import { SketchPicker } from 'react-color'
import { useIntl }      from 'react-intl'

import * as Utils from '../../commonUtils'
import * as UI    from '../styledComponents'

export default function PortalBackground (props:{
  $isDesk: boolean,
  backgroundColor: string,
  updateBackgroundColor: (value: string) => void,
  updateBackgroundImg: (value:{ url: string, file: RcFile }) => void
}) {
  const { $t } = useIntl()
  const { $isDesk, updateBackgroundColor, updateBackgroundImg, backgroundColor } = props
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [clicked, setClicked]=useState(false)
  const content = <div>
    <UI.PopoverButton style={{ marginBottom: 10 }}
      onClick={()=>{
        setShowColorPicker(true)
      }}>{$t({ defaultMessage: 'Set background color' })}</UI.PopoverButton><br/>
    {showColorPicker && <div style={{ marginBottom: 10 }} placeholder='bgcolorpicker'>
      <SketchPicker color={backgroundColor}
        disableAlpha={true}
        onChangeComplete={(color)=> updateBackgroundColor(color.hex)}/>
    </div>}
    <Upload accept='.png,.jpg,.jpeg,.svg,.gif'
      id='bgimageupload'
      showUploadList={false}
      customRequest={async ({ file }) => {
        Utils.getBase64(file as RcFile, url => {
          updateBackgroundImg({ url, file: file as RcFile })
        })
      }}
    >
      <UI.PopoverButton onClick={(e)=>{
        e.preventDefault()
      }}><label htmlFor='bgimageupload' style={{ fontSize: 14 }}>
          {$t({ defaultMessage: 'Select image' })}</label></UI.PopoverButton>
    </Upload>
    <UI.CommonHints>
      {$t({ defaultMessage: 'Recommended size: 1920*1080 ' })}
    </UI.CommonHints></div>

  return (
    <UI.Popover content={content}
      getPopupContainer={()=>document.getElementById('democontent') as HTMLElement}
      overlayClassName={UI.popoverClassName}
      trigger='click'
      placement='bottomLeft'
      visible={clicked}
      onVisibleChange={(value)=>{
        setShowColorPicker(false)
        setClicked(value)}}>
      <UI.PictureOutlined $isDesk={$isDesk}
        title='background setting'
        style={{ position: 'absolute',left: 10,top: 60, cursor: 'pointer' }}
      />
    </UI.Popover>
  )
}
