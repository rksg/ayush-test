import { Tooltip as AntTooltip } from 'antd'
import { useIntl }               from 'react-intl'

import { intlFormats } from '@acx-ui/utils'

import { cssStr } from '../../theme/helper'

import * as UI from './styledComponents'

interface ProgressBarProps {
  percent: number // 0 - 100
}

export const strokeColorsByPercent = (percent: number) => {
  const poor = cssStr('--acx-semantics-red-50') // RED
  const average = cssStr('--acx-semantics-yellow-40') // YELLOW
  const good = cssStr('--acx-semantics-green-50') // GREEN

  // Create array of same color based on the percentage
  if (percent <= 20)
    return Array(1).fill(poor)
  else if (percent <= 60)
    return Array(3).fill(average)
  else
    return Array(5).fill(good)
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
  percent
}: ProgressBarProps) {
  const { $t } = useIntl()

  return <AntTooltip
    placement={'top'}
    title={$t(intlFormats.percentFormat, { value: percent/100 })}>
    <UI.Progress
      percent={normalizePercent(percent)}
      steps={5}
      showInfo={false}
      trailColor={cssStr('--acx-neutrals-30')}
      strokeWidth={10}
      strokeColor={strokeColorsByPercent(percent)} />
  </AntTooltip>
}
