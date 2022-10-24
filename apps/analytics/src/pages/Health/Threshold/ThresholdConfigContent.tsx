import { useIntl }       from 'react-intl'
import { defineMessage } from 'react-intl'

import { Button }    from '@acx-ui/components'
import { formatter } from '@acx-ui/utils'

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
  onReset,
  onApply,
  canSave
}: {
  thresholdValue: string;
  percent: number;
  unit: string;
  shortXFormat: CallableFunction
  onReset?: CallableFunction,
  onApply?: CallableFunction,
  canSave?: boolean
}) {
  const { $t } = useIntl()
  return (
    <UI.HistogramConfig>
      <UI.HistogramSpanContent>
        {$t(thresholdDescText.goal)}
        <UI.HistogramBoldContent>
          {shortXFormat?.(thresholdValue)}
          {unit !== '%' ? ` ${unit}` : unit}
        </UI.HistogramBoldContent>
      </UI.HistogramSpanContent>
      <UI.HistogramGoalPercentage>
        {formatter('percentFormatRound')(percent / 100)}
        <UI.HistogramBoldContent>
          {$t(thresholdDescText.metGoal)}
        </UI.HistogramBoldContent>
      </UI.HistogramGoalPercentage>
      <UI.BtnWrapper>
        <Button style={{ width: 70 }} size='small' onClick={() => onReset && onReset()}>
          {$t(thresholdDescText.resetBtn)}
        </Button>
        <Button style={{ width: 70 }}
          size='small'
          type='secondary'
          onClick={() => onApply && onApply()}
          disabled={!Boolean(canSave)}
        >
          {$t(thresholdDescText.applyBtn)}
        </Button>
      </UI.BtnWrapper>
    </UI.HistogramConfig>
  )
}

export default ThresholdConfig
