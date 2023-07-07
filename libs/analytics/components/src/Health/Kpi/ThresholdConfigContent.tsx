import { MouseEventHandler } from 'react'

import { useIntl,  defineMessage, MessageDescriptor } from 'react-intl'

import { Button, DisabledButton } from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { formatter }              from '@acx-ui/formatter'

import * as UI from './styledComponents'

const thresholdDescText = {
  goal: defineMessage({ defaultMessage: 'Goal' }),
  metGoal: defineMessage({ defaultMessage: 'met goal' }),
  resetBtn: defineMessage({ defaultMessage: 'Reset' }),
  applyBtn: defineMessage({ defaultMessage: 'Apply' })
}

export const getDisabledToolTip = (isNetwork?: boolean, isMLISA?: string) =>
  isNetwork
    ? !isMLISA
      ?
      defineMessage({
        defaultMessage:
        // eslint-disable-next-line max-len
            'Cannot save threshold at organisation level. Please select a Venue or AP to set a threshold.'
      })
      :
      defineMessage({
        defaultMessage:
            'Cannot save threshold at network level. Please select a Zone or AP to set a threshold.'
      })
    :
    defineMessage({
      defaultMessage: "You don't have permission to set threshold for selected network node."
    })

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
  thresholdValue: number;
  percent: number;
  unit: MessageDescriptor | string;
  shortXFormat: CallableFunction;
  onReset: CallableFunction;
  onApply: CallableFunction;
  canSave?: boolean;
  isNetwork?: boolean;
}) {
  const { $t } = useIntl()
  const isDisabled = !Boolean(canSave)
  const isMLISA = get('IS_MLISA_SA')
  const disabledMsg = $t(getDisabledToolTip(isNetwork, isMLISA))
  const resetCallback = () => onReset()
  const applyCallback: MouseEventHandler<HTMLElement> = (e) => {
    onApply()
    e.currentTarget.blur()
  }
  return (
    <UI.HistogramConfig>
      <UI.HistogramSpanContent>
        {$t(thresholdDescText.goal)}
        <UI.HistogramBoldContent>
          {shortXFormat?.(thresholdValue)}
          {typeof unit !== 'string' ? ` ${$t(unit)}` : unit}
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
          onClick={resetCallback}
        >
          {$t(thresholdDescText.resetBtn)}
        </Button>
        {(isDisabled)
          ? <DisabledButton
            style={{ width: 70 }}
            size='small'
            type='secondary'
            title={disabledMsg}
            tooltipPlacement='left'
          >
            {$t(thresholdDescText.applyBtn)}
          </DisabledButton>
          : <Button
            style={{ width: 70 }}
            size='small'
            type='secondary'
            onClick={applyCallback}
          >
            {$t(thresholdDescText.applyBtn)}
          </Button>
        }
      </UI.BtnWrapper>
    </UI.HistogramConfig>
  )
}

export default ThresholdConfig
