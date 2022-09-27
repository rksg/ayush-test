import React from 'react'

import { Loader } from '@acx-ui/components'

import ApifraPoeLow            from './Details/ApifraPoeLow'
import ApinfraWanthroughputLow from './Details/ApinfraWanthroughputLow'
import ApservContinuousReboots from './Details/ApservContinuousReboots'
import ApservDowntimeHigh      from './Details/ApservDowntimeHigh'
import ApservHighNumReboots    from './Details/ApservHighNumReboots'
import Assoc                   from './Details/Assoc'
import Auth                    from './Details/Auth'
import CovClientrssiLow        from './Details/CovClientrssiLow'
import Dhcp                    from './Details/Dhcp'
import Eap                     from './Details/Eap'
import Radius                  from './Details/Radius'
import SwitchMemoryHigh        from './Details/SwitchMemoryHigh'
import SwitchPoePd             from './Details/SwitchPoePd'
import SwitchVlanMismatch      from './Details/SwitchVlanMismatch'
import Ttc                     from './Details/Ttc'
import { useIncident }         from './services'

export const incidentDetailsMap = {
  'radius-failure': Radius,
  'dhcp-failure': Dhcp,
  'eap-failure': Eap,
  'auth-failure': Auth,
  'assoc-failure': Assoc,
  'ttc': Ttc,
  'p-cov-clientrssi-low': CovClientrssiLow,
  'p-switch-memory-high': SwitchMemoryHigh,
  'i-apserv-high-num-reboots': ApservHighNumReboots,
  'i-apserv-continuous-reboots': ApservContinuousReboots,
  'i-apserv-downtime-high': ApservDowntimeHigh,
  'i-switch-vlan-mismatch': SwitchVlanMismatch,
  'i-switch-poe-pd': SwitchPoePd,
  'i-apinfra-poe-low': ApifraPoeLow,
  'i-apinfra-wanthroughput-low': ApinfraWanthroughputLow
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
