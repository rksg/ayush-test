import { useState } from 'react'

import { SketchPicker } from 'react-color'
import { useIntl }      from 'react-intl'

import { UIConfiguration } from '@acx-ui/rc/utils'

import { PopOver } from './PopOver'
import * as UI     from './styledComponents'

export interface ButtonContentProps {
  value: UIConfiguration
  onButtonColorChange: (v:string) => void
  onFontColorChange: (v:string) => void
}

interface WidgetProps {
  visible: boolean
  value:UIConfiguration
  onButtonColorChange: (v:string) => void
  onFontColorChange: (v:string) => void
}

function Widget (props: WidgetProps) {
  const { visible, value, onFontColorChange, onButtonColorChange } = props
  const [showPicker, setShowPicker] = useState(false)
  const [colorCase, setColorCase] = useState('none')
  const widgetElement = <>
    <div style={{ display: 'flex' }}>
      <UI.ButtonColorsOutlined
        $showColorPicker={showPicker && colorCase === 'bg'}
        onClick={(e)=> {
          if (showPicker) {
            setColorCase('none')
          } else {
            setColorCase('bg')
          }
          setShowPicker(!showPicker)
          e.stopPropagation()
        }}
      />
      <UI.ButtonFontColorOutlined
        $showColorPicker={showPicker && colorCase === 'font'}
        onClick={(e)=> {
          if (showPicker) {
            setColorCase('none')
          } else {
            setColorCase('font')
          }
          setShowPicker(!showPicker)
          e.stopPropagation()
        }}
      >
      </UI.ButtonFontColorOutlined>
    </div>

    {showPicker && <div
      placeholder='colorpickcontainer'
      onClick={(e) => e.stopPropagation()}
      style={{ marginTop: 10, marginBottom: 60, marginLeft: -10 }}
    >
      <SketchPicker disableAlpha={true}
        color={colorCase === 'font' ? value.uiColorSchema.buttonFontColor:
          value.uiColorSchema.buttonColor}
        onChangeComplete={(color) => {
          if (colorCase === 'font') {
            onFontColorChange(color.hex)
          } else {
            onButtonColorChange(color.hex)
          }
        }}
      />
    </div>}
  </>
  return <div>{ visible && widgetElement }</div>
}


export function ButtonContent (props: ButtonContentProps) {
  const { value, onButtonColorChange, onFontColorChange } = props
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline] = useState('none')
  const [clicked, setClicked] = useState(false)
  const { $t } = useIntl()
  return (
    <PopOver
      content={<Widget visible={clicked}
        value={value}
        onFontColorChange={onFontColorChange}
        onButtonColorChange={onButtonColorChange}
      />}
      onVisibleChange={(v) => setClicked(v)}
      visible={clicked}
      placement='leftTop'
      overlayInnerStyle={{ backgroundColor: 'var(--acx-neutrals-10)', height: 40, width: 70 }}
    >
      <UI.PortalButton
        style={{
          cursor: cursor,
          outline: outline,
          backgroundColor: value.uiColorSchema.buttonColor,
          color: value.uiColorSchema.buttonFontColor
        }}
        onMouseOver={()=>{
          setCursor('pointer')
          setOutline(UI.hoverOutline)
        }}
        onClick={()=> {
          setCursor('pointer')
          setClicked(true)
          setOutline(UI.hoverOutline)
        }}
      >
        {$t({ defaultMessage: 'Button Style' })}
      </UI.PortalButton>
    </PopOver>
  )
}
