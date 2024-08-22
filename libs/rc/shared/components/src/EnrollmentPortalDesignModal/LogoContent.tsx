import { useState } from 'react'

import { Upload } from 'antd'
import { RcFile } from 'antd/lib/upload'

import { UIConfiguration } from '@acx-ui/rc/utils'

import * as Utils  from './commonUtils'
import RuckusCloud from './images/RuckusCloud.svg'
import { PopOver } from './PopOver'
import * as UI     from './styledComponents'
export interface LogoContentProps {
  value: UIConfiguration
  onLogoChange: (v: string, f: RcFile)=>void
  onRatioChange: (v:number)=>void
  onDisabled: () => void
}

interface WidgetProps {
  value: UIConfiguration
  onLogoChange: (v: string, f: RcFile)=>void
  onRatioChange: (v:number)=>void
  onDisabled: () => void
}

function Widget (props: WidgetProps) {
  const { onLogoChange, onRatioChange, onDisabled, value } = props
  const maxRatio = 2.25
  const minRatio = 1
  const currentRatio = value.uiStyleSchema.logoRatio ?? 1
  const showPlus = currentRatio < maxRatio
  const showMinus = currentRatio > minRatio
  return <div style={{ marginTop: -6 }}
    onClick={(e)=>{e.stopPropagation()}}
  >
    <Upload
      id='logoupload'
      accept='.png,.jpg,.jpeg,.svg,.gif'
      showUploadList={false}
      customRequest={async ({ file })=>{
        Utils.loadFile(file as RcFile, (url: string)=> {
          onLogoChange(url, file as RcFile)
        })
      }}
    >
      <label htmlFor='logoupload'
        placeholder='logoimage'>
        <UI.PictureFilled title='pictureout' onClick={(e)=>{e.stopPropagation()}}/>
      </label>
    </Upload>

    {<UI.PlusOutlined $showPlus={showPlus}
      title='plusen'
      onClick={(e)=>{
        showPlus ? onRatioChange(currentRatio * 1.5):
          e.preventDefault()
      }}/>}
    {<UI.MinusOutlined $showMinus={showMinus}
      title='minusen'
      onClick={(e) => {
        showMinus ? onRatioChange(currentRatio / 1.5):
          e.preventDefault()
      }}/>}
    {value.logoImage &&<UI.EyeSlashSolid
      title='eyehide'
      onClick={()=>{
        onDisabled()
      }}/>}
  </div>
}

export function LogoContent (props: LogoContentProps) {
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline] = useState('none')
  const [clicked, setClicked] = useState(false)
  const { value, onLogoChange, onRatioChange, onDisabled } = props
  return(<PopOver visible={clicked}
    onVisibleChange={(v)=> setClicked(v)}
    content={<Widget
      onLogoChange={onLogoChange}
      onRatioChange={onRatioChange}
      onDisabled={onDisabled}
      value={value}/>}
    placement='leftTop'
    overlayInnerStyle={{
      backgroundColor: 'var(--acx-neutrals-10)',
      height: 30, width: value.logoImage ? 130 : 100
    }}
  >
    <UI.Img
      src={value.logoImage ?? RuckusCloud}
      style={{
        height: 105 * (value.uiStyleSchema.logoRatio ?? 1),
        width: 156 * (value.uiStyleSchema.logoRatio ?? 1),
        cursor: cursor,
        outline: outline,
        maxHeight: '425',
        marginTop: '50',
        marginBottom: '20'
      }}
      alt={'logo'}
      onMouseOver={()=> {
        setCursor('poiinter')
        setOutline(UI.hoverOutline)
      }}
      onMouseLeave={()=>{
        if (!clicked) setOutline('none')
        setCursor('none')
      }}
      onClick={()=>{
        setClicked(true)
        setOutline(UI.hoverOutline)
      }}
    >
    </UI.Img>
  </PopOver>)
}