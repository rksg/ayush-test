import React from 'react'

import { Loader } from '@acx-ui/components'

import ApPoeLow           from './Details/ApPoeLow'
import ApReboot           from './Details/ApReboot'
import ApSzConnFailure    from './Details/ApSzConnFailure'
import ApWanthroughputLow from './Details/ApWanthroughputLow'
import Assoc              from './Details/Assoc'
import Auth               from './Details/Auth'
import Dhcp               from './Details/Dhcp'
import Eap                from './Details/Eap'
import PoePd              from './Details/PoePd'
import Radius             from './Details/Radius'
import Rssi                from './Details/Rssi'
import SwitchMemoryHigh   from './Details/SwitchMemoryHigh'
import SzCpuLoad          from './Details/SzCpuLoad'
import SzNetLatency       from './Details/SzNetLatency'
import TimeFuture         from './Details/TimeFuture'
import TimePast           from './Details/TimePast'
import VlanMismatch       from './Details/VlanMismatch'
import { useIncident }    from './services'

export const incidentDetailsMap = {
  'radius-failure': Radius,
  'dhcp-failure': Dhcp,
  'eap-failure': Eap,
  'auth-failure': Auth,
  'assoc-failure': Assoc,
  'p-cov-clientrssi-low': Rssi,
  'p-load-sz-cpu-load': SzCpuLoad,
  'p-switch-memory-high': SwitchMemoryHigh,
  'i-net-time-future': TimeFuture,
  'i-net-time-past': TimePast,
  'i-net-sz-net-latency': SzNetLatency,
  'i-apserv-high-num-reboots': ApReboot,
  'i-apserv-continuous-reboots': ApReboot,
  'i-apserv-downtime-high': ApSzConnFailure,
  'i-switch-vlan-mismatch': VlanMismatch,
  'i-switch-poe-pd': PoePd,
  'i-apinfra-poe-low': ApPoeLow,
  'i-apinfra-wanthroughput-low': ApWanthroughputLow
}

function IncidentDetailsPage () {
  const queryResults = useIncident()
  const code = queryResults.data?.code as keyof typeof incidentDetailsMap
  const IncidentDetails = code ? incidentDetailsMap[code] : null
  return (
    <Loader states={[queryResults]}>
      {IncidentDetails && <IncidentDetails {...queryResults.data!} />}
    </Loader>
  )
}

export default IncidentDetailsPage
