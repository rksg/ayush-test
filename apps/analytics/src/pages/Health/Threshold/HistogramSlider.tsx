
import * as UI from './styledComponents'

import type { SliderMarks } from 'antd/es/slider'

function HistogramSlider ({
  splits,
  width,
  height,
  sliderValue,
  onSliderChange
}: {
  splits: number[];
  width: number;
  height: number;
  sliderValue : number;
  onSliderChange: ((value: number) => void) | undefined
}) {
  const marks: number[] = splits.map((_: number, index: number) => index)

  return (
    <UI.StyledSlider
      min={0}
      max={splits?.length + 1}
      onChange={onSliderChange}
      marks={marks as unknown as SliderMarks}
      value={sliderValue}
      tooltipVisible={false}
      step={0.5}
      range={false}
      style={{
        width: width * 0.95,
        top: height * 0.56,
        marginLeft: width * 0.075
      }}
    />
  )
}
export default HistogramSlider
