import { useState } from 'react'

import { Upload }       from 'antd'
import { RcFile }       from 'antd/lib/upload'
import { SketchPicker } from 'react-color'
import { useIntl }      from 'react-intl'

import { UIConfiguration } from '@acx-ui/rc/utils'

import * as Utils  from './commonUtils'
import { PopOver } from './PopOver'
import * as UI     from './styledComponents'
export interface BackgroundContentProps {
  $isDesk: boolean
  value: UIConfiguration
  onColorChange: (v: string) => void
  onImageChange: (v:string, f: RcFile) => void
}

export function BackgroundContent (props: BackgroundContentProps){
  const { $t } = useIntl()
  const { $isDesk, value, onColorChange, onImageChange } = props
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [clicked, setClicked]=useState(false)
  const content = <div>
    <UI.PopoverButton style={{ marginBottom: 10 }}
      onClick={()=>{
        setShowColorPicker(true)
      }}>
      {$t({ defaultMessage: 'Set background color' })}
    </UI.PopoverButton>
    <br/>
    {showColorPicker &&
    <div style={{ marginBottom: 10 }} placeholder='bgcolorpicker'>
      <SketchPicker color={value.uiColorSchema.backgroundColor}
        disableAlpha={true}
        onChangeComplete={(color)=> onColorChange(color.hex)}/>
    </div>}
    <Upload accept='.png,.jpg,.jpeg,.svg,.gif'
      id='bgimageupload'
      showUploadList={false}
      customRequest={async ({ file }) => {
        Utils.loadFile(file as RcFile, url => {
          onImageChange(url, file as RcFile)
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
    <PopOver content={content}
      placement='bottomLeft'
      visible={clicked}
      onVisibleChange={(value)=>{
        setShowColorPicker(false)
        setClicked(value)}}>
      <UI.PictureOutlined $isDesk={$isDesk}
        title='background setting'
        style={{ position: 'absolute',left: 10,top: 60, cursor: 'pointer' }}
      />
    </PopOver>
  )
}