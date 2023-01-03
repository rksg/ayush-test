import { Upload }       from 'antd'
import { RcFile }       from 'antd/lib/upload'
import { SketchPicker } from 'react-color'

import * as Utils from '../../commonUtils'
import * as UI    from '../styledComponents'
const maxSize = 2.25
const minSize = 1
export default function PortalImageTools (props:{
  updateDemoImg: (value: { url?:string,size?:number,show?:boolean,text?:string
    color?:string, file?:RcFile }) => void,
  size?:number,
  url?:string,
  showEye?:boolean,
  showColorPic?:boolean,
  showImg?:boolean,
  showText?: boolean,
  defaultSize?:number
  color?:string,
  showColorPicker?:boolean,
  setShowColorPicker?: (value:boolean) => void
}) {
  const { updateDemoImg, size, showEye, url,showText,color,
    showImg, showColorPic, defaultSize, showColorPicker, setShowColorPicker } = props
  const showMinusEn = (size !== minSize*(defaultSize as number))
  const showPlusEn = (size !== maxSize*(defaultSize as number))
  const now = Date.now()
  return (
    <>
      <div style={{ marginTop: -6 }}
        onClick={(e)=>{e.stopPropagation()}}>
        <Upload accept='.png,.jpg,.jpeg,.svg,.gif'
          id={'contentimageupload'+now}
          showUploadList={false}
          customRequest={async ({ file }) => {
            Utils.getBase64(file as RcFile, url => {
              updateDemoImg({ url: url, size: size, show: true, file: file as RcFile })
            })
          }}
        >
          {showImg !== false && <label htmlFor={'contentimageupload'+now}
            placeholder='contentimageupload'>
            <UI.PictureFilled
              title='pictureout'
              onClick={(e)=>e.stopPropagation()}/></label>}
        </Upload>

        {showImg!==false
        &&<UI.PlusOutlined $showPlus={showPlusEn}
          title='plusen'
          onClick={(e)=>{
            showPlusEn? updateDemoImg({ url: url||'', size: (size as number)*1.5, show: true }):
              e.preventDefault()
          }}/>}
        {showImg!==false &&
          <UI.MinusOutlined $showMinus={showMinusEn}
            title='minusen'
            onClick={(e) => {
              showMinusEn? updateDemoImg({ url: url||'', size: (size as number)/1.5, show: true }):
                e.preventDefault()
            }}/>}
        {showText!==false &&<UI.TextPlus $showPlus={showPlusEn}
          title='textplus'
          onClick={()=>{
            if(size !== maxSize*(defaultSize as number))updateDemoImg({ size: (size as number)*1.5,
              show: true, color: color })
          }}
        /> }
        {showText!==false && <UI.TextMinus $showMinus={showMinusEn}
          title='textminus'
          onClick={()=>{
            if(size!==minSize*(defaultSize as number))updateDemoImg({ size: (size as number)/1.5,
              show: true, color: color })
          }}/>}
        {showColorPic!==false && <UI.FontColorsOutlined
          $showColorPicker={showColorPicker}
          title='colorpick'
          onClick={(e)=>{
            setShowColorPicker?.(!showColorPicker)
            e.stopPropagation()
          }}
        />}
        {showEye !== false &&<UI.EyeSlashSolid
          title='eyehide'
          onClick={()=>{
            updateDemoImg({ url: url||'', size: size, show: false } )
          }}/>}
      </div>
      {showColorPic!==false && showColorPicker &&<div
        placeholder='colorpickcontainer'
        onClick={(e)=>e.stopPropagation()}
        style={{ marginTop: 10, marginBottom: 60, marginLeft: -10 }}>
        <SketchPicker
          color={color}
          disableAlpha={true}
          onChangeComplete={(color)=> updateDemoImg({ color: color.hex, show: true,size: size })}/>
      </div>}
    </>
  )
}

