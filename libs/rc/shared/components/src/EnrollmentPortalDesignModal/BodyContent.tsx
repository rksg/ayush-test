import { useState } from 'react'

import TextArea         from 'antd/lib/input/TextArea'
import { SketchPicker } from 'react-color'
import { useIntl }      from 'react-intl'

import { UIConfiguration } from '@acx-ui/rc/utils'

import { PopOver } from './PopOver'
import * as UI     from './styledComponents'

export interface BodyContentProps {
  value: UIConfiguration
  onColorChange: (v:string)=>void
  onSizeChange: (v:number)=>void
}

interface WidgetProps {
  size: number
  color: string
  onColorChange: (v:string)=>void
  onSizeChange: (v:number)=>void
}

function Widget (props: WidgetProps) {
  const maxSize = 14
  const minSize = 10
  const { size, color, onColorChange, onSizeChange } = props
  const showPlus = size < maxSize
  const showMinus = size > minSize
  const [showPicker, setShowPicker] = useState(false)
  return (
    <>
      <div style={{ display: 'flex' }}>
        <UI.TextPlus $showPlus={showPlus}
          title='textplus'
          onClick={(e) => {
            showPlus ? onSizeChange(size+1) : e.preventDefault()
          }}
        />
        <UI.TextMinus $showMinus={showMinus}
          title='textminus'
          onClick={(e) => {
            showMinus ? onSizeChange(size-1) : e.preventDefault()
          }}
        />
        <UI.FontColorsOutlined $showColorPicker={showPicker}
          onClick={(e) => {
            setShowPicker(!showPicker)
            e.stopPropagation()
          }}
        />
      </div>
      { showPicker &&
        <div placeholder='colorpickcontainer'
          style={{ marginTop: 10, marginBottom: 60, marginLeft: -10 }}
          onClick={(e)=> e.stopPropagation()}>
          <SketchPicker disableAlpha={true}
            color={color}
            onChangeComplete={(color)=> onColorChange?.(color.hex)}
          />
        </div>
      }
    </>
  )

}

export function BodyContent (props: BodyContentProps) {
  const { value, onColorChange, onSizeChange } = props
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline] = useState('none')
  const [clicked, setClicked] = useState(false)
  const { $t } = useIntl()
  return (
    <PopOver content={<Widget
      color={value.uiColorSchema.bodyFontColor}
      size={value.uiStyleSchema.bodyFontSize}
      onColorChange={onColorChange}
      onSizeChange={onSizeChange}/>}
    visible={clicked}
    onVisibleChange={(v) => setClicked(v)}
    placement='leftTop'
    overlayInnerStyle={{ backgroundColor: 'var(--acx-neutrals-10)', height: 40, width: 100 }}
    >
      <TextArea
        value={$t({ defaultMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' })}
        placeholder='bodytext'
        rows={4}
        style={{
          fontSize: value.uiStyleSchema.bodyFontSize,
          color: value.uiColorSchema.bodyFontColor,
          cursor: cursor,
          outline: outline,
          fontWeight: 300,
          resize: 'none',
          height: 60,
          width: 310,
          maxWidth: 425 }}
        onMouseOver={() => {
          setCursor('pointer')
          setOutline(UI.hoverOutline)
        }}
        onMouseLeave={() => {
          if (!clicked){
            setCursor('none')
            setOutline('none')
          }
        }}
        onClick={() => {
          setCursor('pointer')
          setClicked(true)
          setOutline(UI.hoverOutline)
        }}
      />
    </PopOver>
  )
}