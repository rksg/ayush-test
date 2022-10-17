
import { useState } from 'react'

import { Upload }       from 'antd'
import { RcFile }       from 'antd/lib/upload'
import { SketchPicker } from 'react-color'
import { useIntl }      from 'react-intl'

import * as UI from '../styledComponents'

export default function PortalBackground (props:{
  $isDesk: boolean,
  backgroundColor: string,
  updateBackgroundColor: (value: string) => void,
  updateBackgroundImg: (value: string) => void
}) {
  const { $t } = useIntl()
  const { $isDesk, updateBackgroundColor, updateBackgroundImg, backgroundColor } = props
  const [showSetting, setShowSetting] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)


  const onClose = () =>{
    setShowSetting(false)
  }
  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result as string))
    reader.readAsDataURL(img)
  }

  return (
    <>
      <UI.PictureOutlined $isDesk={$isDesk}
        onClick={() => {
          setShowSetting(true)
          setShowColorPicker(false)
        }}
      />
      <UI.BackgroundContainer $isShow={showSetting} onMouseLeave={onClose}>
        <UI.Button onClick={(e)=>{
          e.preventDefault()
          setShowColorPicker(true)
        }}>{$t({ defaultMessage: 'Set background color' })}</UI.Button><br/>
        {showColorPicker && <div style={{ margin: '5px 0 20px 15px' }}>
          <SketchPicker color={backgroundColor}
            onChangeComplete={(color)=> updateBackgroundColor(color.hex)}/>
        </div>}
        <Upload accept='.png,.jpg,.jpeg'

          showUploadList={false}
          customRequest={async ({ file }) => {
            getBase64(file as RcFile, url => {
              updateBackgroundImg(url)
            })
          }}
        >
          <UI.Button onClick={(e)=>{
            e.preventDefault()
          }}>{$t({ defaultMessage: 'Select image' })}</UI.Button>
        </Upload>
        <UI.CommonLabel style={{ marginLeft: 10, paddingLeft: 6, paddingTop: 0 }}>
          {$t({ defaultMessage: 'Recommended size: 1920*1080 ' })}
        </UI.CommonLabel>
      </UI.BackgroundContainer>
    </>

  )
}
