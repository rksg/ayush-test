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

const getDisabledToolTip = (isNetwork?: boolean) => (isNetwork)
  // eslint-disable-next-line max-len
  ? defineMessage({ defaultMessage: 'Cannot save threshold at organisation level.{ br } Please select a Venue or AP to set a threshold.' })
  // eslint-disable-next-line max-len
  : defineMessage({ defaultMessage: 'You don\'t have permission to set threshold for selected network node.' })

function ThresholdConfig ({
  thresholdValue,
  percent,
  unit,
  shortXFormat,
  onReset,
  onApply,
  canSave,
  isNetwork
}: {
  thresholdValue: string;
  percent: number;
  shortXFormat: CallableFunction;
  onReset?: CallableFunction;
  onApply?: CallableFunction;
  canSave?: boolean;
  isNetwork?: boolean;
  unit: MessageDescriptor;
}) {
  const { $t } = useIntl()
  const isDisabled = !Boolean(canSave)
  const disabledMsg = $t(getDisabledToolTip(isNetwork), { br: '\n' })
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
        <Button style={{ width: 70 }} size='small' onClick={() => onReset && onReset()}>
          {$t(thresholdDescText.resetBtn)}
        </Button>
        {(isDisabled)
          ? <DisabledButton
            size='small'
            type='secondary'
            title={disabledMsg}
            tooltipPlacement='left'
          >
            {$t(thresholdDescText.applyBtn)}
          </DisabledButton>
          : <Button
            style={{ width: 70, pointerEvents: (isDisabled) ? 'none' : 'auto' }}
            size='small'
            type='secondary'
            onClick={() => onApply && onApply()}
            disabled={isDisabled}
          >
            {$t(thresholdDescText.applyBtn)}
          </Button>
        }
      </UI.BtnWrapper>
    </UI.HistogramConfig>
  )
}

export default ThresholdConfig
