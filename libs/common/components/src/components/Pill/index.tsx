import React from 'react'

import * as UI from './styledComponents'

export type TrendType = 'none' | 'positive' | 'negative' | 'P1' | 'P2' | 'P3' | 'P4'

interface PillProps {
  value: string
  trend: TrendType
}

export function Pill ({ value, trend }: PillProps) {
  return (
    <UI.Pill trend={trend}>{value}</UI.Pill>
  )
}
