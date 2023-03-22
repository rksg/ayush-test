import { useIntl } from 'react-intl'

import { intlFormats } from '@acx-ui/formatter'

import { cssStr }  from '../../theme/helper'
import { Tooltip } from '../Tooltip'

import * as UI from './styledComponents'

interface UsageRateProps {
  percent: number // 0 - 100
}


const strokeColorsByPercent = (percent: number) => {
  const full = cssStr('--acx-semantics-red-50')
  const poor = cssStr('--acx-semantics-green-50')
  const warn = cssStr('--acx-semantics-yellow-40')
  // Create array of same color based on the percentage
  if (percent <= 20)
    return Array(1).fill(poor)
  else if (percent <= 60)
    return Array(3).fill(poor)
  else if (percent <= 70)
    return Array(5).fill(warn)
  else
    return Array(5).fill(full)
}

const normalizePercent = (percent: number) => {
  if (percent < 1)
    return 0
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

export function UsageRate ({
  percent
}: UsageRateProps) {
  const { $t } = useIntl()

  return <Tooltip
    placement={'top'}
    title={$t(intlFormats.percentFormat, { value: percent/100 })}>
    <UI.Usage
      percent={normalizePercent(percent)}
      steps={5}
      showInfo={false}
      trailColor={cssStr('--acx-neutrals-30')}
      strokeWidth={10}
      strokeColor={strokeColorsByPercent(percent)} />
  </Tooltip>
}
