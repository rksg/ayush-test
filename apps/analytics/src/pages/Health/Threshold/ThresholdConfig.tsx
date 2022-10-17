/* eslint-disable @typescript-eslint/no-explicit-any */


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
export function ThresholdConfig ({
  thresholdValue,
  percent,
  unit,
  shortXFormat
}: {
  thresholdValue: number;
  percent: number;
  unit: string;
  shortXFormat: CallableFunction
}) {
  const { $t } = useIntl()
  return (
    <UI.HistogramConfig>
      <UI.HistogramSpanContent>
        {$t(thresholdDescText.goal)}
        <UI.HistogramBoldContent>
          {shortXFormat?.(thresholdValue)} {unit}
        </UI.HistogramBoldContent>
      </UI.HistogramSpanContent>
      <UI.HistogramGoalPercentage>
        {formatter('percentFormatRound')(percent / 100)}
        <UI.HistogramBoldContent>
          {$t(thresholdDescText.metGoal)}
        </UI.HistogramBoldContent>
      </UI.HistogramGoalPercentage>
      <UI.BtnWrapper>
        <Button size='small'>{$t(thresholdDescText.resetBtn)}</Button>
        <Button size='small' type='secondary'>
          {$t(thresholdDescText.applyBtn)}
        </Button>
      </UI.BtnWrapper>
    </UI.HistogramConfig>
  )
}

export default ThresholdConfig
