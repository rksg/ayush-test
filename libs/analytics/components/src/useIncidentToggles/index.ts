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
    ].some(Boolean)
  }
}
