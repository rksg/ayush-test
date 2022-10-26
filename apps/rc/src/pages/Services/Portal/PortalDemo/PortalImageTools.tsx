
import { useState } from 'react'

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
  color?:string
}) {
  const { updateDemoImg, size, showEye, url,showText,color,
    showImg, showColorPic, defaultSize } = props
  const [showColorPicker, setShowColorPicker]=useState(false)
  return (
    <>
      <div style={{ marginTop: -6 }}
        onClick={(e)=>{e.stopPropagation()
          setShowColorPicker(false)
        }}>
        <Upload accept='.png,.jpg,.jpeg'
          showUploadList={false}
          customRequest={async ({ file }) => {
            Utils.getBase64(file as RcFile, url => {
              updateDemoImg({ url: url, size: size, show: true })
            })
          }}
        >
          {showImg !== false && <UI.ToolImg src={PictureOut}/>}
        </Upload>
        {showImg!==false && size !== maxSize*(defaultSize as number)
        &&<UI.ToolImg src={PlusEn}
          onClick={()=>{
            updateDemoImg({ url: url||'', size: (size as number)*1.5, show: true })
          }}/>}
        {showImg!==false && size === maxSize*(defaultSize as number) && <UI.ToolImg src={PlusDis}/>}
        {showImg!==false && size !== minSize*(defaultSize as number) && <UI.ToolImg src={MinusEn}
          onClick={() => {
            updateDemoImg({ url: url||'', size: (size as number)/1.5, show: true })
          }} />}
        {showImg!==false && size === minSize*(defaultSize as number)
         && <UI.ToolImg src={MinusDis}/>}
        {showText!==false && <UI.ToolImg src={TextPlus}
          onClick={()=>{
            if(size !== maxSize*(defaultSize as number))updateDemoImg({ size: (size as number)*1.5,
              show: true, color: color })
          }}/>}
        {showText!==false && <UI.ToolImg src={TextMinus}
          onClick={()=>{
            if(size!==minSize*(defaultSize as number))updateDemoImg({ size: (size as number)/1.5,
              show: true, color: color })
          }}/>}
        {showColorPic!==false && <UI.ToolImg src={ColorPick}
          onClick={(e)=>{
            setShowColorPicker(true)
            e.stopPropagation()
          }}
        />}
        {showEye !== false &&<UI.ToolImg src={EyeHide}
          onClick={()=>{
            updateDemoImg({ url: url||'', size: size, show: false } )
          }}/>}
      </div>
      {showColorPic!==false && showColorPicker &&<div
        style={{ marginTop: 10 }}
        onClick={(e)=>e.stopPropagation()}
        onMouseLeave={()=>setShowColorPicker(false)}>
        <SketchPicker
          color={color}
          disableAlpha={true}
          onChangeComplete={(color)=> updateDemoImg({ color: color.hex, show: true,size: size })}/>
      </div>}
    </>
  )
}

