import { useIntl } from 'react-intl'

import { SLAConfig }                             from './constants'
import { SliderLabel, SliderName, StyledSlider } from './styledComponents'

interface SLAStepSliderProps {
  slaConfig: SLAConfig;
  sliderValue: number;
  splits: number[];
  onSliderChange: (value: number) => void;
}

const SLAStepSlider = ({
  slaConfig,
  sliderValue,
  splits,
  onSliderChange
}: SLAStepSliderProps) => {
  const { title, units } = slaConfig
  const { $t } = useIntl()
  const marks = splits.reduce(
    (acc, value, index) => ({
      ...acc,
      [index]: {
        label: (
          <SliderLabel isSelected={index === sliderValue}>
            {slaConfig.formatter?.(value)}
          </SliderLabel>
        )
      }
    }),
    {}
  )

  return (
    <div>
      <SliderName>{$t(title)}{units ? ` (${$t(units)})` : ''}</SliderName>
      <StyledSlider
        min={0}
        max={splits.length - 1}
        marks={marks}
        onChange={onSliderChange}
        value={sliderValue}
        tooltipVisible={false}
      />
    </div>
  )
}

export default SLAStepSlider
