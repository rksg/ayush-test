import { IncidentToggle }         from '@acx-ui/analytics/utils'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

export function useIncidentToggles () {
  return {
    [IncidentToggle.AirtimeIncidents]: [
      useIsSplitOn(Features.INCIDENTS_AIRTIME_TOGGLE),
      useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_AIRTIME_TOGGLE)
    ].some(Boolean),
    [IncidentToggle.SwitchDDoSIncidents]: [
      useIsSplitOn(Features.INCIDENTS_SWITCH_DDOS_TOGGLE),
      useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_DDOS_TOGGLE)
    ].some(Boolean),
    [IncidentToggle.SwitchLoopDetectionIncidents]: [
      useIsSplitOn(Features.INCIDENTS_SWITCH_LOOP_DETECTION_TOGGLE),
      useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_LOOP_DETECTION_TOGGLE)
    ].some(Boolean),
    [IncidentToggle.SwitchLLDPStatusIncidents]: [
      useIsSplitOn(Features.INCIDENTS_SWITCH_LLDP_STATUS_TOGGLE),
      useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_LLDP_STATUS_TOGGLE)
    ].some(Boolean),
    [IncidentToggle.SwitchPortFlapIncidents]: [
      !useIsSplitOn(Features.INCIDENTS_SWITCH_PORT_FLAP_TOGGLE),
      !useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_PORT_FLAP_TOGGLE)
    ].some(Boolean),
    [IncidentToggle.SwitchPortCongestionIncidents]: [
      useIsSplitOn(Features.INCIDENTS_SWITCH_PORT_CONGESTION_TOGGLE),
      useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_PORT_CONGESTION_TOGGLE)
    ].some(Boolean),
    [IncidentToggle.SwitchUplinkPortCongestionIncidents]: [
      useIsSplitOn(Features.INCIDENTS_SWITCH_UPLINK_PORT_CONGESTION_TOGGLE),
      useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_UPLINK_PORT_CONGESTION_TOGGLE)
    ].some(Boolean)
  }
}
