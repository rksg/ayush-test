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
export type DrilldownSelection = 'connectionFailure' | 'ttc' | null

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
) => [
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