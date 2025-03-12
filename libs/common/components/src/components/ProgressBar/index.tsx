import { useIntl } from 'react-intl'

import { intlFormats } from '@acx-ui/formatter'

import { cssStr }  from '../../theme/helper'
import { Tooltip } from '../Tooltip'

import * as UI from './styledComponents'

import type { ProgressBarProps } from './styledComponents'



const red = cssStr('--acx-semantics-red-50')
const yellow = cssStr('--acx-semantics-yellow-40')
const green = cssStr('--acx-semantics-green-50')

export const strokeColorsCompletionByPercent = (percent: number) => {
  // Create array of same color based on the percentage
  if (percent <= 20)
    return Array(1).fill(red)
  else if (percent <= 60)
    return Array(3).fill(yellow)
  return Array(5).fill(green)
}

export const strokeColorsUsageByPercent = (percent: number) => {
  if (percent <= 25)
    return green
  else if (percent <= 50)
    return yellow
  return red
}

export const normalizePercent = (percent: number) => {
  if (percent <= 20)
    return 20
  else if (percent > 20 && percent <= 40)
    return 40
  else if (percent > 40 && percent <= 60)
    return 60
  else if (percent > 60 && percent <= 80)
    return 80
  return 100
}

export function ProgressBar ({
  percent, strokeWidth = 10
}: ProgressBarProps) {
  const { $t } = useIntl()

  return <Tooltip
    placement={'top'}
    title={$t(intlFormats.percentFormat, { value: percent/100 })}>
    <UI.Progress
      percent={normalizePercent(percent)}
      steps={5}
      showInfo={false}
      trailColor={cssStr('--acx-neutrals-30')}
      strokeWidth={strokeWidth}
      strokeColor={strokeColorsCompletionByPercent(percent)} />
  </Tooltip>
}

export function ProgressBarV2 ({
  percent, strokeWidth = 10, gradientMode='completion', style
}: ProgressBarProps) {
  const { $t } = useIntl()

  return <Tooltip
    placement={'top'}
    title={$t(intlFormats.percentFormat, { value: percent/100 })}>
    <UI.Progress
      percent={percent}
      showInfo={false}
      trailColor={cssStr('--acx-neutrals-30')}
      strokeWidth={strokeWidth}
      strokeColor={gradientMode === 'usage' ?
        strokeColorsUsageByPercent(percent) : strokeColorsCompletionByPercent(percent)}
      style={style}
      gradientmode={gradientMode}
    />
  </Tooltip>
}
