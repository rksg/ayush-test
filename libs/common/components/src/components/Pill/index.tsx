import React from 'react'

import type { IncidentSeverity } from '@acx-ui/analytics/utils'

import * as UI from './styledComponents'

export type TrendType = 'none' | 'positive' | 'negative'
export type { IncidentSeverity }

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
  severity: IncidentSeverity
}
export function SeverityPill ({ severity }: SeverityPillProps) {
  return (
    <UI.Pill type={severity}>{severity}</UI.Pill>
  )
}
