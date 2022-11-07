import { useIntl,  defineMessage, MessageDescriptor } from 'react-intl'

import { Button, DisabledButton } from '@acx-ui/components'
import { formatter }              from '@acx-ui/utils'

import * as UI from './styledComponents'

const thresholdDescText = {
  goal: defineMessage({ defaultMessage: 'Goal' }),
  metGoal: defineMessage({ defaultMessage: 'met goal' }),
  resetBtn: defineMessage({ defaultMessage: 'Reset' }),
  applyBtn: defineMessage({ defaultMessage: 'Apply' })
}
function ThresholdConfig ({
  thresholdValue,
  percent,
  unit,
  shortXFormat,
  onReset
}: {
  thresholdValue: string;
  percent: number;
  unit: MessageDescriptor;
  shortXFormat: CallableFunction,
  onReset: React.MouseEventHandler<HTMLElement>
}) {
  const { $t } = useIntl()
  return (
    <UI.HistogramConfig>
      <UI.HistogramSpanContent>
        {$t(thresholdDescText.goal)}
        <UI.HistogramBoldContent>
          {shortXFormat?.(thresholdValue)}
          {unit !== '%' ? ` ${$t(unit)}` : unit}
        </UI.HistogramBoldContent>
      </UI.HistogramSpanContent>
      <UI.HistogramGoalPercentage>
        {formatter('percentFormatRound')(percent / 100)}
        <UI.HistogramBoldContent>
          {$t(thresholdDescText.metGoal)}
        </UI.HistogramBoldContent>
      </UI.HistogramGoalPercentage>
      <UI.BtnWrapper>
        <Button
          style={{ width: 70 }}
          size='small'
          onClick={onReset}>
          {$t(thresholdDescText.resetBtn)}
        </Button>
        <DisabledButton
          style={{ width: 70 }}
          size='small'
          type='secondary'
          onClick={onReset}>
          {$t(thresholdDescText.applyBtn)}
        </DisabledButton>
      </UI.BtnWrapper>
    </UI.HistogramConfig>
  )
}

export default ThresholdConfig
