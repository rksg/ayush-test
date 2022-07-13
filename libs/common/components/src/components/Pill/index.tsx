import React from 'react'

import * as UI from './styledComponents'

export type TrendType = 'none' | 'positive' | 'negative'

interface PillProps {
  value: string
  trend: TrendType
}

export function Pill ({ value, trend }: PillProps) {
  return (
    <UI.Pill trend={trend}>{value}</UI.Pill>
  )
}
