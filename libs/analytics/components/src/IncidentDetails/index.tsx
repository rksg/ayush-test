import { get } from 'lodash'

import { Loader }    from '@acx-ui/components'
import { useParams } from '@acx-ui/react-router-dom'

import { AirtimeB }                   from './Details/AirtimeB'
import { AirtimeRx }                  from './Details/AirtimeRx'
import { AirtimeTx }                  from './Details/AirtimeTx'
import { ApinfraPoeLow }              from './Details/ApinfraPoeLow'
import { ApinfraWanthroughputLow }    from './Details/ApinfraWanthroughputLow'
import { ApservContinuousReboots }    from './Details/ApservContinuousReboots'
import { ApservDowntimeHigh }         from './Details/ApservDowntimeHigh'
import { ApservHighNumReboots }       from './Details/ApservHighNumReboots'
import { AssocFailure }               from './Details/AssocFailure'
import { AuthFailure }                from './Details/AuthFailure'
import { ChannelDist }                from './Details/ChannelDist'
import { CovClientrssiLow }           from './Details/CovClientrssiLow'
import { DhcpFailure }                from './Details/DhcpFailure'
import { EapFailure }                 from './Details/EapFailure'
import { LoadSzCpuLoad }              from './Details/LoadSzCpuLoad'
import { NetSzNetLatency }            from './Details/NetSzNetLatency'
import { NetTime }                    from './Details/NetTime'
import { RadiusFailure }              from './Details/RadiusFailure'
import { SwitchLLDPStatus }           from './Details/SwitchLLDPStatus'
import { SwitchLoopDetection }        from './Details/SwitchLoopDetection'
import { SwitchMemoryHigh }           from './Details/SwitchMemoryHigh'
import { SwitchPoePd }                from './Details/SwitchPoePd'
import { SwitchPortCongestion }       from './Details/SwitchPortCongestion'
import { SwitchPortFlap }             from './Details/SwitchPortFlap'
import { SwitchTcpSynDDoS }           from './Details/SwitchTcpSynDDoS'
import { SwitchUplinkPortCongestion } from './Details/SwitchUplinkPortCongestion'
import { SwitchVlanMismatch }         from './Details/SwitchVlanMismatch'
import { Ttc }                        from './Details/Ttc'
import {
  useIncidentCodeQuery,
  useIncidentDetailsQuery
} from './services'

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
  'i-switch-loop-detection': SwitchLoopDetection,
  'i-switch-lldp-status': SwitchLLDPStatus,
  'i-switch-port-flap': SwitchPortFlap,
  'p-channeldist-suboptimal-plan-24g': ChannelDist,
  'p-channeldist-suboptimal-plan-50g-outdoor': ChannelDist,
  'p-channeldist-suboptimal-plan-50g-indoor': ChannelDist,
  'i-net-time-future': NetTime,
  'i-net-time-past': NetTime,
  'i-net-sz-net-latency': NetSzNetLatency,
  'p-load-sz-cpu-load': LoadSzCpuLoad,
  'p-airtime-b-24g-high': AirtimeB,
  'p-airtime-b-5g-high': AirtimeB,
  'p-airtime-b-6(5)g-high': AirtimeB,
  'p-airtime-rx-24g-high': AirtimeRx,
  'p-airtime-rx-5g-high': AirtimeRx,
  'p-airtime-rx-6(5)g-high': AirtimeRx,
  'p-airtime-tx-24g-high': AirtimeTx,
  'p-airtime-tx-5g-high': AirtimeTx,
  'p-airtime-tx-6(5)g-high': AirtimeTx,
  'p-switch-port-congestion': SwitchPortCongestion,
  'p-switch-uplink-port-congestion': SwitchUplinkPortCongestion,
  's-switch-tcp-syn-ddos': SwitchTcpSynDDoS
}

export function IncidentDetails () {
  const params = useParams()
  const id = get(params, 'incidentId', undefined) as string
  const codeQuery = useIncidentCodeQuery({ id })
  const detailsQuery = useIncidentDetailsQuery(
    codeQuery.data!,
    { skip: !Boolean(codeQuery.data) }
  )
  const code = codeQuery.data?.code
  const IncidentDetails = code ? incidentDetailsMap[code] : null
  return (
    <Loader states={[codeQuery, detailsQuery]}>
      {IncidentDetails && <IncidentDetails {...detailsQuery.data!} />}
    </Loader>
  )
}
