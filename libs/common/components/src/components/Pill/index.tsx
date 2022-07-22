import React from 'react'

import * as UI from './styledComponents'

interface PillProps {
  value: string
  trend: UI.TrendType
}

export function Pill ({ value, trend }: PillProps) {
  return (
    <UI.Pill trend={trend}>{value}</UI.Pill>
  )
}
