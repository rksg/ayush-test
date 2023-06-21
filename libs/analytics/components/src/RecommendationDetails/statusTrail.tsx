import { capitalize } from 'lodash'
import { useIntl }    from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import configData                                                  from './configRecommendationData'
import { EnhancedRecommendation }                                  from './services'
import { DetailsHeader, StatusTrailDateLabel, StatusTrailWrapper } from './styledComponents'

const { states } = configData

const trailFormatter = (trail: Array<{ status: string }>, trailIndex: number) => {
  const set = trail.slice(trailIndex, trailIndex + 2)
  const patterns = [
    {
      pattern: [states.applied, states.revertScheduled],
      replacement: `${states.applied} (Revert Canceled)`
    },
    {
      pattern: [states.new, states.applyScheduled],
      replacement: `${states.new} (Apply Canceled)`
    }
  ]
  for (const { pattern, replacement } of patterns) {
    const matched = pattern.every((status, index) => status === set[index]?.status)
    if (matched) return replacement
  }
  return trail[trailIndex].status
}

const getStatusTrail = (details: EnhancedRecommendation) => {
  const { statusTrail } = details
  return statusTrail.map(({ createdAt }, index) => ({
    status: trailFormatter(statusTrail, index),
    createdAt: formatter('calendarFormat')(createdAt)
  }))
}

const StatusTrailItem = ({ statusTrail }:
  { statusTrail: EnhancedRecommendation['statusTrail'][0] }) => {
  const { status, createdAt } = statusTrail
  return <StatusTrailWrapper>
    <StatusTrailDateLabel>{createdAt}</StatusTrailDateLabel> {capitalize(status)}
  </StatusTrailWrapper>
}

export const StatusTrail = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const statusTrail = getStatusTrail(details)
  return <>
    <DetailsHeader>{$t({ defaultMessage: 'Status Trail' })}</DetailsHeader>
    {statusTrail.map((val, ind) => <StatusTrailItem statusTrail={val} key={ind} />)}
  </>
}