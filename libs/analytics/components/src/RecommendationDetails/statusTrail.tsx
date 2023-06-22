import { defineMessage, IntlShape, MessageDescriptor, useIntl } from 'react-intl'

import { GridCol, GridRow } from '@acx-ui/components'
import { formatter }        from '@acx-ui/formatter'

import { states, statusTrailMsgs }                                                         from './configRecommendationData'
import { EnhancedRecommendation }                                                          from './services'
import { DetailsHeader, StatusTrailDateLabel, StatusTrailItemWrapper, StatusTrailWrapper } from './styledComponents'




const trailFormatter = (trail: Array<{ status: keyof typeof states }>, trailIndex: number) => {
  const set = trail.slice(trailIndex, trailIndex + 2)
  const patterns = [
    {
      pattern: [states.applied, states.revertScheduled],
      replacement: defineMessage({ defaultMessage: 'Applied (Revert Canceled)' })
    },
    {
      pattern: [states.new, states.applyScheduled],
      replacement: defineMessage({ defaultMessage: 'New (Apply Canceled)' })
    }
  ]
  for (const { pattern, replacement } of patterns) {
    const matched = pattern.every((status, index) => status === set[index]?.status)
    if (matched) return replacement
  }
  return statusTrailMsgs[trail[trailIndex].status]
}

const getStatusTrail = (details: EnhancedRecommendation) => {
  const { statusTrail } = details
  return statusTrail.map(({ createdAt }, index) => ({
    status: trailFormatter(statusTrail, index),
    createdAt: formatter('calendarFormat')(createdAt)
  }))
}

const StatusTrailItem = ({ statusTrail, $t }:
  { statusTrail: { status: MessageDescriptor, createdAt: string }, $t: IntlShape['$t'] }) => {
  const { status, createdAt } = statusTrail
  return <StatusTrailItemWrapper>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StatusTrailDateLabel>{createdAt}</StatusTrailDateLabel>
      </GridCol>
      <GridCol col={{ span: 14 }}>{$t(status)}</GridCol>
    </GridRow>
  </StatusTrailItemWrapper>
}

export const StatusTrail = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const statusTrail = getStatusTrail(details)
  return <>
    <DetailsHeader>{$t({ defaultMessage: 'Status Trail' })}</DetailsHeader>
    <StatusTrailWrapper>
      {statusTrail.map((val, ind) => <StatusTrailItem statusTrail={val} key={ind} $t={$t} />)}
    </StatusTrailWrapper>
  </>
}