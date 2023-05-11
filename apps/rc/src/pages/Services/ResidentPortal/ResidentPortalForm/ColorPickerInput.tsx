import { useEffect, useState } from 'react'

import { Button, Popover, Space } from 'antd'
import { SketchPicker }           from 'react-color'
import { useIntl }                from 'react-intl'

import { isValidColorHex } from '../residentPortalUtilities'

interface OnChangeHandler {
  // eslint-disable-next-line
  (e: any): void;
}

export interface ColorPickerProps {
  value: string,
  onChange: OnChangeHandler,
  colorName: string,
  defaultColorHex: string
}

// NOTE: this component can be used as in 'Input' in an antd Form.Item
export function ColorPickerInput (props: ColorPickerProps) {
  const { $t } = useIntl()

  const {
    value,
    onChange,
    colorName,
    defaultColorHex
  } = props

  const [selectedColor, setSelectedColor] =
    useState(value && isValidColorHex(value) ? value : defaultColorHex)
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)

  useEffect(() => {
    if(value) {
      setSelectedColor(value)
    }
  }, [value])

  const updateSelectedColor = (color:string) => {
    setSelectedColor(color)
    onChange(color)
  }

  // RENDER //////////////////////////////////////////////////////
  return (
    <Space>
      <Popover
        title={colorName}
        placement='topLeft'
        content={
          <div>
            <div style={{ marginBottom: 10 }} placeholder='colorpicker'>
              <SketchPicker color={selectedColor}
                disableAlpha={true}
                onChangeComplete={(color) => updateSelectedColor(color.hex)} />
            </div>
          </div>}
        trigger='click'
        visible={showColorPicker}
        onVisibleChange={setShowColorPicker}>

        <Button
          type='primary'
          color={selectedColor}
          style={{ minWidth: 150, backgroundColor: selectedColor, borderColor: selectedColor }}
          onClick={()=>{
            setShowColorPicker(true)
          }}>
          {/* show button with no text */}
              &nbsp;
        </Button>
      </Popover>

      <Button type='link' onClick={()=>{setShowColorPicker(true)}}>
        {$t({ defaultMessage: 'Change' })}
      </Button>
      <Button type='link'
        onClick={() => {
          updateSelectedColor(defaultColorHex)
          setShowColorPicker(false)
        }}>
        {$t({ defaultMessage: 'Reset to Default' })}
      </Button>
    </Space>
  )
}
