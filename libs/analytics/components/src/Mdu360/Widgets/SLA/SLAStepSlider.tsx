import { useIntl } from 'react-intl'

import { SLAConfig }                             from './constants'
import { SliderLabel, SliderName, StyledSlider } from './styledComponents'

interface SLAStepSliderProps {
  slaConfig: SLAConfig;
  sliderValue: number;
  onSliderChange: (value: number) => void;
}

const SLAStepSlider = ({
  slaConfig,
  sliderValue,
  onSliderChange
}: SLAStepSliderProps) => {
  const { splits: _splits, title, units } = slaConfig
  const splits = _splits ?? []
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
