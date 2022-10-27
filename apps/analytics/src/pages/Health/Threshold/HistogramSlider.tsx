import * as UI from './styledComponents'

import type { SliderMarks } from 'antd/es/slider'
function HistogramSlider ({
  splits,
  width,
  height,
  sliderValue,
  onSliderChange,
  shortXFormat
}: {
  splits: number[];
  width: number;
  height: number;
  sliderValue : number;
  onSliderChange: ((value: number) => void) | undefined,
  shortXFormat: CallableFunction
}) {

  const marks = splits.reduce((acc, value,index) => ({
    ...acc,
    [index+1]: { label: <UI.SliderLabel>{shortXFormat(value)}</UI.SliderLabel> }
  }), {})
  return (
    <UI.StyledSlider
      min={0}
      max={splits?.length + 1}
      onChange={onSliderChange}
      marks={marks as unknown as SliderMarks}
      value={sliderValue}
      tooltipVisible={false}
      step={1}
      range={false}
      style={{
        width: width * 0.95,
        top: height * 0.65,
        left: 16
      }}
    />
  )
}
export default HistogramSlider
