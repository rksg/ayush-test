import React from 'react'

import { Loader } from '@acx-ui/components'

import { ApinfraPoeLow }           from './Details/ApinfraPoeLow'
import { ApinfraWanthroughputLow } from './Details/ApinfraWanthroughputLow'
import { ApservContinuousReboots } from './Details/ApservContinuousReboots'
import { ApservDowntimeHigh }      from './Details/ApservDowntimeHigh'
import { ApservHighNumReboots }    from './Details/ApservHighNumReboots'
import { AssocFailure }            from './Details/AssocFailure'
import { AuthFailure }             from './Details/AuthFailure'
import { ChannelDist }             from './Details/ChannelDist'
import { CovClientrssiLow }        from './Details/CovClientrssiLow'
import { DhcpFailure }             from './Details/DhcpFailure'
import { EapFailure }              from './Details/EapFailure'
import { LoadSzCpuLoad }           from './Details/LoadSzCpuLoad'
import { NetSzNetLatency }         from './Details/NetSzNetLatency'
import { NetTime }                 from './Details/NetTime'
import { RadiusFailure }           from './Details/RadiusFailure'
import { SwitchMemoryHigh }        from './Details/SwitchMemoryHigh'
import { SwitchPoePd }             from './Details/SwitchPoePd'
import { SwitchVlanMismatch }      from './Details/SwitchVlanMismatch'
import { Ttc }                     from './Details/Ttc'
import { useIncident }             from './services'

export const incidentDetailsMap = {
  'radius-failure': RadiusFailure,
  'dhcp-failure': DhcpFailure,
  'eap-failure': EapFailure,
  'auth-failure': AuthFailure,
  'assoc-failure': AssocFailure,
  'ttc': Ttc,
  'p-cov-clientrssi-low': CovClientrssiLow,
  'p-switch-memory-high': SwitchMemoryHigh,
  'i-apinfra-poe-low': ApinfraPoeLow,
  'i-apinfra-wanthroughput-low': ApinfraWanthroughputLow,
  'i-apserv-continuous-reboots': ApservContinuousReboots,
  'i-apserv-downtime-high': ApservDowntimeHigh,
  'i-apserv-high-num-reboots': ApservHighNumReboots,
  'i-switch-poe-pd': SwitchPoePd,
  'i-switch-vlan-mismatch': SwitchVlanMismatch,
  'p-channeldist-suboptimal-plan-24g': ChannelDist,
  'p-channeldist-suboptimal-plan-50g-outdoor': ChannelDist,
  'p-channeldist-suboptimal-plan-50g-indoor': ChannelDist,
  'i-net-time-future': NetTime,
  'i-net-time-past': NetTime,
  'i-net-sz-net-latency': NetSzNetLatency,
  'p-load-sz-cpu-load': LoadSzCpuLoad
}

export function IncidentDetails () {
  const queryResults = useIncident()
  const code = queryResults.data?.code as keyof typeof incidentDetailsMap
  const IncidentDetails = code ? incidentDetailsMap[code] : null
  return (
    <Loader states={[queryResults]}>
      {IncidentDetails && <IncidentDetails {...queryResults.data!} />}
    </Loader>
  )
}

