import { get }                               from 'lodash'
import { defineMessage, IntlShape, useIntl } from 'react-intl'

import { Card }                      from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { statusTrailMsgs }                from '../../IntentAIForm/AIDrivenRRM'
import { StatusTrail as StatusTrailType } from '../../IntentAIForm/config'
import { EnhancedIntent }                 from '../../IntentAIForm/services'
import {
  DetailsHeader,
  StatusTrailDateLabel,
  StatusTrailItemWrapper,
  StatusTrailWrapper
} from '../styledComponents'

const trailFormatter = (
  trail: StatusTrailType,
  trailIndex: number, $t: IntlShape['$t']) => {
  const set = trail.slice(trailIndex, trailIndex + 2)
  const patterns = [
    {
      pattern: ['applied', 'revertscheduled'],
      replacement: defineMessage({ defaultMessage: 'Applied (Revert Canceled)' })
    },
    {
      pattern: ['applyfailed', 'revertscheduled'],
      replacement: defineMessage({ defaultMessage: 'Failed (Revert Canceled)' })
    },
    {
      pattern: ['revertfailed', 'revertscheduled'],
      replacement: defineMessage({ defaultMessage: 'Revert Failed (Revert Canceled)' })
    },
    {
      pattern: ['applywarning', 'revertscheduled'],
      replacement: defineMessage({ defaultMessage: 'REVERT (Revert Canceled)' })
    },
    {
      pattern: ['new', 'applyscheduled'],
      replacement: defineMessage({ defaultMessage: 'New (Apply Canceled)' })
    }
  ]
  for (const { pattern, replacement } of patterns) {
    const matched = pattern.every((status, index) => status === set[index]?.status)
    if (matched) return $t(replacement)
  }
  const status = get(trail[trailIndex], 'status')
  const msg = get(statusTrailMsgs, status, { defaultMessage: 'Unknown' })
  return $t(msg)
}

const getStatusTrail = (details: EnhancedIntent, $t: IntlShape['$t']) => {
  const { statusTrail } = details
  return statusTrail.map(({ createdAt }, index) => ({
    status: trailFormatter(statusTrail, index, $t),
    createdAt: formatter(DateFormatEnum.DateTimeFormat)(createdAt)
  }))
}

const StatusTrailItem = ({ statusTrail }:{ statusTrail: ReturnType<typeof getStatusTrail>[0] }) => {
  const { status, createdAt } = statusTrail
  return <StatusTrailItemWrapper>
    <StatusTrailDateLabel>{createdAt}</StatusTrailDateLabel>
    {status}
  </StatusTrailItemWrapper>
}

export const StatusTrail = ({ details }: { details: EnhancedIntent }) => {
  const { $t } = useIntl()
  const statusTrail = getStatusTrail(details, $t)
  return <div style={{ marginTop: 40 }}>
    <DetailsHeader>{$t({ defaultMessage: 'Status Trail' })}</DetailsHeader>
    <StatusTrailWrapper>
      <Card>
        {statusTrail.map((val, ind) => <StatusTrailItem statusTrail={val} key={ind}/>)}
      </Card>
    </StatusTrailWrapper>
  </div>
}
