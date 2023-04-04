import { MouseEventHandler } from 'react'

import { defineMessage, MessageDescriptor } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

export const titleConfig = {
  connectionFailure: defineMessage({ defaultMessage: 'Connection Failures' }),
  ttc: defineMessage({ defaultMessage: 'Average Time To Connect' })
}
export type Stages =
  | 'authFailure'
  | 'assoFailure'
  | 'eapFailure'
  | 'radiusFailure'
  | 'dhcpFailure'
  | null
export type FunnelChartStages = { name: string; label: MessageDescriptor; value: number | null, apiKey: string }[]
export type DrilldownSelection = 'connectionFailure' | 'ttc' | null
export type FunnelChartStage = {
  formattedPct: string;
  pct: number;
  width: number;
  name: string;
  label: MessageDescriptor;
  value: number | null;
  apiKey: string;
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
    label:
      type === 'connectionFailure'
        ? defineMessage({ defaultMessage: '802.11 Auth. Failure' })
        : defineMessage({ defaultMessage: '802.11 Auth.' }),
    value: authFailure,
    apiKey: 'auth'
  },
  {
    name: 'Association',
    label:
      type === 'connectionFailure'
        ? defineMessage({ defaultMessage: 'Assoc. Failure' })
        : defineMessage({ defaultMessage: 'Association' }),
    value: assoFailure,
    apiKey: 'assoc'
  },
  {
    name: 'EAP',
    label:
      type === 'connectionFailure'
        ? defineMessage({ defaultMessage: 'EAP Failure' })
        : defineMessage({ defaultMessage: 'EAP' }),
    value: eapFailure,
    apiKey: 'eap'
  },
  {
    name: 'Radius',
    label:
      type === 'connectionFailure'
        ? defineMessage({ defaultMessage: 'RADIUS Failure' })
        : defineMessage({ defaultMessage: 'RADIUS' }),
    value: radiusFailure,
    apiKey: 'radius'
  },
  {
    name: 'DHCP',
    label:
      type === 'connectionFailure'
        ? defineMessage({ defaultMessage: 'DHCP Failure' })
        : defineMessage({ defaultMessage: 'DHCP' }),
    value: dhcpFailure,
    apiKey: 'dhcp'
  }
]

export const CONNECTIONFAILURE = 'connectionFailure'
export const TTC = 'ttc'

export const valueFormatter = (value: number) => formatter('durationFormat')(value)
export const stageMapToName: Record<string, string> = {
   'auth': 'AUTHENTICATION',
   'assoc': 'ASSOCIATION',
   'eap': 'EAP',
   'radius': 'RADIUS',
   'dhcp': 'DHCP'
}

