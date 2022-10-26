
import { useState } from 'react'

import { Upload }       from 'antd'
import { RcFile }       from 'antd/lib/upload'
import { SketchPicker } from 'react-color'
import { useIntl }      from 'react-intl'

import PictureSec from '../../../../assets/images/portal-demo/icon_pic.svg'
import PictureOut from '../../../../assets/images/portal-demo/imgToggle.svg'
import * as Utils from '../../commonUtils'
import * as UI    from '../styledComponents'

export default function PortalBackground (props:{
  $isDesk: boolean,
  backgroundColor: string,
  updateBackgroundColor: (value: string) => void,
  updateBackgroundImg: (value: string) => void
}) {
  const { $t } = useIntl()
  const { $isDesk, updateBackgroundColor, updateBackgroundImg, backgroundColor } = props
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [clicked, setClicked]=useState(false)
  const content = <div>
    <UI.PopoverButton style={{ marginBottom: 10 }}
      onClick={(e)=>{
        e.preventDefault()
        setShowColorPicker(true)
      }}>{$t({ defaultMessage: 'Set background color' })}</UI.PopoverButton><br/>
    {showColorPicker && <div style={{ marginBottom: 10 }}>
      <SketchPicker color={backgroundColor}
        disableAlpha={true}
        onChangeComplete={(color)=> updateBackgroundColor(color.hex)}/>
    </div>}
    <Upload accept='.png,.jpg,.jpeg'
      showUploadList={false}
      customRequest={async ({ file }) => {
        Utils.getBase64(file as RcFile, url => {
          updateBackgroundImg(url)
        })
      }}
    >
      <UI.PopoverButton onClick={(e)=>{
        e.preventDefault()
      }}>{$t({ defaultMessage: 'Select image' })}</UI.PopoverButton>
    </Upload>
    <UI.CommonHints>
      {$t({ defaultMessage: 'Recommended size: 1920*1080 ' })}
    </UI.CommonHints></div>

  return (
    <UI.Popover content={content}
      overlayClassName='uipopover'
      trigger='click'
      placement='bottomLeft'
      visible={clicked}
      onVisibleChange={(value)=>{
        setShowColorPicker(false)
        setClicked(value)}}>
      <UI.Img src={$isDesk?PictureOut:PictureSec}
        alt='background setting'
        style={{ position: 'absolute',left: 10,top: 60, cursor: 'pointer' }}
      />
    </UI.Popover>
  )
}
