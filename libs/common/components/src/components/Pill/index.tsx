import React from 'react'

import type { IncidentSeverities } from '@acx-ui/analytics/utils'

import * as UI from './styledComponents'

export type TrendType = 'none' | 'positive' | 'negative'
export type { IncidentSeverities }

interface TrendPillProps {
  trend: TrendType
  value: string
}
export function TrendPill ({ trend, value }: TrendPillProps) {
  return (
    <UI.Pill type={trend}>{value}</UI.Pill>
  )
}

interface SeverityPillProps {
  severity: IncidentSeverities
}
export function SeverityPill ({ severity }: SeverityPillProps) {
  return (
    <UI.Pill type={severity}>{severity}</UI.Pill>
  )
}
