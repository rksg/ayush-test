import { Upload }       from 'antd'
import { RcFile }       from 'antd/lib/upload'
import { SketchPicker } from 'react-color'

import ColorPick  from '../../../../assets/images/portal-demo/colorPick.svg'
import EyeHide    from '../../../../assets/images/portal-demo/eyeHide.svg'
import PictureOut from '../../../../assets/images/portal-demo/imgToggle.svg'
import MinusDis   from '../../../../assets/images/portal-demo/minusDisable.svg'
import MinusEn    from '../../../../assets/images/portal-demo/minusToggle.svg'
import PlusDis    from '../../../../assets/images/portal-demo/plusDisable.svg'
import PlusEn     from '../../../../assets/images/portal-demo/plusToggle.svg'
import TextMinus  from '../../../../assets/images/portal-demo/textMinus.svg'
import TextPlus   from '../../../../assets/images/portal-demo/textPlus.svg'
import * as Utils from '../../commonUtils'
import * as UI    from '../styledComponents'
const maxSize = 2.25
const minSize = 1
export default function PortalImageTools (props:{
  updateDemoImg: (value: { url?:string,size?:number,show?:boolean,text?:string
    color?:string }) => void,
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
  return (
    <>
      <div style={{ marginTop: -6 }}
        onClick={(e)=>{e.stopPropagation()}}>
        <Upload accept='.png,.jpg,.jpeg'
          id='contentimageupload'
          showUploadList={false}
          customRequest={async ({ file }) => {
            Utils.getBase64(file as RcFile, url => {
              updateDemoImg({ url: url, size: size, show: true })
            })
          }}
        >
          {showImg !== false && <label htmlFor='contentimageupload'
            placeholder='contentimageupload'>
            <UI.ToolImg src={PictureOut}
              alt='pictureout'
              onClick={(e)=>e.stopPropagation()}/></label>}
        </Upload>

        {showImg!==false
        &&<UI.ToolImg src={showPlusEn? PlusEn:PlusDis}
          alt={showPlusEn?'plusen':'plusdis'}
          onClick={(e)=>{
            showPlusEn? updateDemoImg({ url: url||'', size: (size as number)*1.5, show: true }):
              e.preventDefault()
          }}/>}
        {showImg!==false &&<UI.WrappedButton type='text'
          onClick={(e) => {
            showMinusEn? updateDemoImg({ url: url||'', size: (size as number)/1.5, show: true }):
              e.preventDefault()
          }}>
          <UI.ToolImg src={showMinusEn? MinusEn:MinusDis}
            alt='minusen'
          /></UI.WrappedButton>}
        {showText!==false && <UI.ToolImg src={TextPlus}
          alt='textplus'
          onClick={()=>{
            if(size !== maxSize*(defaultSize as number))updateDemoImg({ size: (size as number)*1.5,
              show: true, color: color })
          }}/>}
        {showText!==false && <UI.ToolImg src={TextMinus}
          alt='textminus'
          onClick={()=>{
            if(size!==minSize*(defaultSize as number))updateDemoImg({ size: (size as number)/1.5,
              show: true, color: color })
          }}/>}
        {showColorPic!==false && <UI.ToolImg src={ColorPick}
          alt='colorpick'
          onClick={(e)=>{
            setShowColorPicker?.(!showColorPicker)
            e.stopPropagation()
          }}
        />}
        {showEye !== false &&<UI.ToolImg src={EyeHide}
          alt='eyehide'
          onClick={()=>{
            updateDemoImg({ url: url||'', size: size, show: false } )
          }}/>}
      </div>
      {showColorPic!==false && showColorPicker &&<div
        placeholder='colorpickcontainer'
        style={{ marginTop: 10, position: 'absolute', marginLeft: -10 }}>
        <SketchPicker
          color={color}
          disableAlpha={true}
          onChangeComplete={(color)=> updateDemoImg({ color: color.hex, show: true,size: size })}/>
      </div>}
    </>
  )
}

