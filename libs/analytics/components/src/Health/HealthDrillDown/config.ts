import { MouseEventHandler } from 'react'

import { cssStr }    from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

export const titleConfig = {
  connectionFailure: 'Connection Failures',
  ttc: 'Average Time To Connect'
}
export type Stages =
  | 'authFailure'
  | 'assoFailure'
  | 'eapFailure'
  | 'radiusFailure'
  | 'dhcpFailure'
  | null
export type FunnelChartStages = { name: string; label: string; value: number | null }[]
export type DrilldownSelection = 'connectionFailure' | 'ttc' | null
export type FunnelChartStage = {
  formattedPct: string;
  pct: number;
  width: number;
  name: string;
  label: string;
  value: number | null;
}
export type EnhancedStage = FunnelChartStage & {
  valueLabel: string;
  valueFormatter: CallableFunction;
  onClick: MouseEventHandler<HTMLDivElement>;
  key: string;
  isSelected: boolean;
  idx: number;
  bgColor: string;
  endPosition: number;
}

export const getFormattedToFunnel = (
  type: DrilldownSelection,
  {
    authFailure,
    assoFailure,
    eapFailure,
    radiusFailure,
    dhcpFailure
  }: {
    authFailure: number | null;
    assoFailure: number | null;
    eapFailure: number | null;
    radiusFailure: number | null;
    dhcpFailure: number | null;
  }
): FunnelChartStages => [
  {
    name: 'Authentication',
    label: type === 'connectionFailure' ? '802.11 Auth. Failure' : '802.11 Auth.',
    value: authFailure
  },
  {
    name: 'Association',
    label: type === 'connectionFailure' ? 'Assoc. Failure' : 'Association',
    value: assoFailure
  },
  { name: 'EAP', label: type === 'connectionFailure' ? 'EAP Failure' : 'EAP', value: eapFailure },
  {
    name: 'Radius',
    label: type === 'connectionFailure' ? 'RADIUS Failure' : 'RADIUS',
    value: radiusFailure
  },
  {
    name: 'DHCP',
    label: type === 'connectionFailure' ? 'DHCP Failure' : 'DHCP',
    value: dhcpFailure
  }
]

export const CONNECTIONFAILURE = 'connectionFailure'

export const valueFormatter = (value: number) => formatter('durationFormat')(value)

export const FunnelChartColors = [
  cssStr('--acx-accents-blue-80'),
  cssStr('--acx-accents-blue-70'),
  cssStr('--acx-accents-blue-60'),
  cssStr('--acx-accents-blue-55'),
  cssStr('--acx-accents-blue-50')
]
