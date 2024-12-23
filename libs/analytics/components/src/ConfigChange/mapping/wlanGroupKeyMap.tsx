import { defineMessage } from 'react-intl'

/* eslint-disable max-len */
export const wlanGroupKeyMap = [
  { id: -1, value: 'initialState.CcmWlanGroup.member', text: 'TBD', textAlto: 'TBD', enumType: '', incidents: {}, kpis: {} },
  { id: 1, value: 'initialState.CcmWlanGroup.id', text: 'NA', textAlto: 'TBD', enumType: '', incidents: {}, kpis: {} },
  { id: 2, value: 'initialState.CcmWlanGroup.name', text: defineMessage({ defaultMessage: 'WLAN Group Name' }), textAlto: 'TBD', enumType: '', incidents: {}, kpis: {} },
  { id: 3, value: 'initialState.CcmWlanGroup.description', text: defineMessage({ defaultMessage: 'WLAN Group Description' }), textAlto: 'TBD', enumType: '', incidents: {}, kpis: {} },
  { id: 4, value: 'initialState.CcmWlanGroup.zone_id', text: 'NA', textAlto: 'TBD', enumType: '', incidents: {}, kpis: {} },
  { id: 5, value: 'initialState.CcmWlanGroup.domain_id', text: 'NA', textAlto: 'TBD', enumType: '', incidents: {}, kpis: {} },
  { id: 6, value: 'initialState.CcmWlanGroup.tenant_id', text: 'NA', textAlto: 'TBD', enumType: '', incidents: {}, kpis: {} },
  { id: 7, value: 'initialState.CcmWlanGroup.member.wlan_id', text: 'NA', textAlto: 'TBD', enumType: '', incidents: {}, kpis: {} },
  { id: 8, value: 'initialState.CcmWlanGroup.member.override_vlan_id', text: defineMessage({ defaultMessage: 'VLAN ID' }), textAlto: 'TBD', enumType: '', incidents: { 'dhcp-failure': 1, 'ttc': 0.5, 'i-apserv-high-num-reboots': 1, 'i-apserv-continuous-reboots': 1, 'i-switch-vlan-mismatch': 1 }, kpis: { dhcp: 1 } },
  { id: 9, value: 'initialState.CcmWlanGroup.member.override_vlan_pooling_id', text: 'NA', textAlto: 'TBD', enumType: '', incidents: { 'dhcp-failure': 0.5, 'i-apserv-high-num-reboots': 1, 'i-apserv-continuous-reboots': 1, 'i-switch-vlan-mismatch': 1 }, kpis: {} },
  { id: 10, value: 'initialState.CcmWlanGroup.member.override_nas_id', text: defineMessage({ defaultMessage: 'NAS ID' }), textAlto: 'TBD', enumType: '', incidents: { 'radius-failure': 0.5 }, kpis: {} }
]
