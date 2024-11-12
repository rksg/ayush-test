import { useState } from 'react'

import { Upload }  from 'antd'
import { RcFile }  from 'antd/lib/upload'
import { useIntl } from 'react-intl'

import { baseUrlFor }                                  from '@acx-ui/config'
import { getLogoImageSize, LogoSize, UIConfiguration } from '@acx-ui/rc/utils'

import * as Utils  from './commonUtils'
import { PopOver } from './PopOver'
import * as UI     from './styledComponents'

const RuckusCloud = baseUrlFor('/assets/images/portal/RuckusCloud.png')

export interface LogoContentProps {
  value: UIConfiguration
  onLogoChange: (v: string, f: RcFile)=>void
  onSizeChange: (v:LogoSize)=>void
  onDisabled: () => void
}

interface WidgetProps {
  value: UIConfiguration
  onLogoChange: (v: string, f: RcFile)=>void
  onSizeChange: (v:LogoSize)=>void
  onDisabled: () => void
}

function Widget (props: WidgetProps) {
  const { onLogoChange, onSizeChange, onDisabled, value } = props
  const maxSize:LogoSize = 'LARGE'
  const minSize:LogoSize = 'SMALL'
  const currentSize = value.uiStyleSchema.logoSize
  const showPlus = currentSize !== maxSize
  const showMinus = currentSize !== minSize

  const getChangedSize = (current:LogoSize, direction: 'PLUS' | 'MINUS' ): LogoSize => {
    if (direction === 'PLUS') {
      if (current === 'SMALL')
        return 'MEDIUM'
      else if (current === 'MEDIUM')
        return 'LARGE'
    } else if (direction === 'MINUS') {
      if (current === 'LARGE')
        return 'MEDIUM'
      else if (current === 'MEDIUM')
        return 'SMALL'
    }
    return current
  }

  return <div style={{ marginTop: -6 }}
    onClick={(e)=>{e.stopPropagation()}}
  >
    <Upload
      id='logoupload'
      accept='.png,.jpg,.jpeg'
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
        showPlus ? onSizeChange(getChangedSize(currentSize, 'PLUS')):
          e.preventDefault()
      }}/>}
    {<UI.MinusOutlined $showMinus={showMinus}
      title='minusen'
      onClick={(e) => {
        showMinus ? onSizeChange(getChangedSize(currentSize, 'MINUS')):
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
  const { value, onLogoChange, onSizeChange, onDisabled } = props
  const { $t } = useIntl()
  return(<PopOver visible={clicked}
    onVisibleChange={(v)=> setClicked(v)}
    content={<Widget
      onLogoChange={onLogoChange}
      onSizeChange={onSizeChange}
      onDisabled={onDisabled}
      value={value}/>}
    placement='leftTop'
    overlayInnerStyle={{
      backgroundColor: 'var(--acx-neutrals-10)',
      height: 30, width: value.logoImage ? 130 : 100
    }}
  >
    <div>
      <UI.Img
        src={value.logoImage ?? RuckusCloud}
        style={{
          height: getLogoImageSize(value.uiStyleSchema.logoSize),
          width: getLogoImageSize(value.uiStyleSchema.logoSize),
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
      <UI.CommonHints style={{ textAlign: 'center' }}>
        {$t({ defaultMessage: 'Maximum size: 8MB ' })}
      </UI.CommonHints>
    </div>
  </PopOver>)
}
