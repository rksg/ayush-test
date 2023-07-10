import { get }                               from 'lodash'
import { defineMessage, IntlShape, useIntl } from 'react-intl'

import { GridCol, GridRow }          from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { states, statusTrailMsgs } from '../config'

import { EnhancedRecommendation } from './services'
import {
  DetailsHeader,
  StatusTrailDateLabel,
  StatusTrailItemWrapper,
  StatusTrailWrapper
} from './styledComponents'

const trailFormatter = (
  trail: Array<{ status: Lowercase<keyof typeof states> }>,
  trailIndex: number, $t: IntlShape['$t']) => {
  const set = trail.slice(trailIndex, trailIndex + 2)
  const patterns = [
    {
      pattern: ['applied', 'revertscheduled'],
      replacement: defineMessage({ defaultMessage: 'Applied (Revert Canceled)' })
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
  const msg = get(statusTrailMsgs, status, undefined)
  return msg ? $t(msg) : $t({ defaultMessage: 'Unknown' })
}

const getStatusTrail = (details: EnhancedRecommendation, $t: IntlShape['$t']) => {
  const { statusTrail } = details
  return statusTrail.map(({ createdAt }, index) => ({
    status: trailFormatter(statusTrail, index, $t),
    createdAt: formatter(DateFormatEnum.DateTimeFormat)(createdAt)
  }))
}

const StatusTrailItem = ({ statusTrail }:{ statusTrail: ReturnType<typeof getStatusTrail>[0] }) => {
  const { status, createdAt } = statusTrail
  return <StatusTrailItemWrapper>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StatusTrailDateLabel>{createdAt}</StatusTrailDateLabel>
      </GridCol>
      <GridCol col={{ span: 14 }}>{status}</GridCol>
    </GridRow>
  </StatusTrailItemWrapper>
}

export const StatusTrail = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const statusTrail = getStatusTrail(details, $t)
  return <>
    <DetailsHeader>{$t({ defaultMessage: 'Status Trail' })}</DetailsHeader>
    <StatusTrailWrapper>
      {statusTrail.map((val, ind) => <StatusTrailItem statusTrail={val} key={ind} />)}
    </StatusTrailWrapper>
  </>
}