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
}

interface WidgetProps {
  color: string
  onColorChange: (v:string)=>void
}

function Widget (props: WidgetProps) {
  const { color, onColorChange } = props
  const [showPicker, setShowPicker] = useState(false)
  return (
    <>
      <div style={{ display: 'flex' }}>
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
  const { value, onColorChange } = props
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline] = useState('none')
  const [clicked, setClicked] = useState(false)
  const { $t } = useIntl()
  return (
    <PopOver content={<Widget
      color={value.uiColorSchema.fontColor}
      onColorChange={onColorChange}/>}
    visible={clicked}
    onVisibleChange={(v) => setClicked(v)}
    placement='leftTop'
    overlayInnerStyle={{ backgroundColor: 'var(--acx-neutrals-10)', height: 40, width: 40 }}
    >
      <TextArea
        maxLength={100}
        value={$t({ defaultMessage: 'Body text style' })}
        placeholder='bodytext'
        rows={4}
        style={{
          fontSize: 14,
          color: value.uiColorSchema.fontColor,
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