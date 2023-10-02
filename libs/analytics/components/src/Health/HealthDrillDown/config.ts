import { MouseEventHandler } from 'react'

import { defineMessage, IntlShape, MessageDescriptor } from 'react-intl'

export const titleConfig = {
  connectionFailure: defineMessage({ defaultMessage: 'Connection Failures' }),
  ttc: defineMessage({ defaultMessage: 'Average Time To Connect' })
}
export const topImpactedClientLimit = 10
export type Stages =
  | 'Authentication'
  | 'Association'
  | 'EAP'
  | 'Radius'
  | 'DHCP'
export type FunnelChartStages = {
    name: string;
    label: MessageDescriptor;
    value: number | null
}[]
export type DrilldownSelection = 'connectionFailure' | 'ttc' | null
export type FunnelChartStage = {
  formattedPct: string;
  pct: number;
  width: number;
  name: string;
  label: MessageDescriptor | string;
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
    label:
      type === 'connectionFailure'
        ? defineMessage({ defaultMessage: '802.11 Auth. Failure' })
        : defineMessage({ defaultMessage: '802.11 Auth.' }),
    value: authFailure
  },
  {
    name: 'Association',
    label:
      type === 'connectionFailure'
        ? defineMessage({ defaultMessage: 'Assoc. Failure' })
        : defineMessage({ defaultMessage: 'Association' }),
    value: assoFailure
  },
  {
    name: 'EAP',
    label:
      type === 'connectionFailure'
        ? defineMessage({ defaultMessage: 'EAP Failure' })
        : defineMessage({ defaultMessage: 'EAP' }),
    value: eapFailure
  },
  {
    name: 'Radius',
    label:
      type === 'connectionFailure'
        ? defineMessage({ defaultMessage: 'RADIUS Failure' })
        : defineMessage({ defaultMessage: 'RADIUS' }),
    value: radiusFailure
  },
  {
    name: 'DHCP',
    label:
      type === 'connectionFailure'
        ? defineMessage({ defaultMessage: 'DHCP Failure' })
        : defineMessage({ defaultMessage: 'DHCP' }),
    value: dhcpFailure
  }
]

export const CONNECTIONFAILURE = 'connectionFailure'
export const TTC = 'ttc'

export const stageNameToCodeMap: Record<Stages, string> = {
  Authentication: 'auth',
  Association: 'assoc',
  EAP: 'eap',
  Radius: 'radius',
  DHCP: 'dhcp'
}

export const stageLabels: Record<Stages, MessageDescriptor> = {
  Authentication: defineMessage({ defaultMessage: 'Authentication' }),
  Association: defineMessage({ defaultMessage: 'Association' }),
  EAP: defineMessage({ defaultMessage: 'EAP' }),
  Radius: defineMessage({ defaultMessage: 'RADIUS' }),
  DHCP: defineMessage({ defaultMessage: 'DHCP' })
}

export const showTopResult = ($t: IntlShape['$t'], count: number, limit: number) => count > limit
  ? $t({ defaultMessage: 'Top {limit}' }, { limit })
  : count
