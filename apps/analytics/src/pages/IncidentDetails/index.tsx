import { Loader }    from '@acx-ui/components'
import { useParams } from '@acx-ui/react-router-dom'

import Assoc                       from './Details/Assoc'
import Auth                        from './Details/Auth'
import Dhcp                        from './Details/Dhcp'
import Eap                         from './Details/Eap'
import Radius                      from './Details/Radius'
import { useIncidentDetailsQuery } from './services'
import { IncidentDetailsProps }    from './types'

export const incidentDetailsMap = {
  'radius-failure': Radius,
  'dhcp-failure': Dhcp,
  'eap-failure': Eap,
  'auth-failure': Auth,
  'assoc-failure': Assoc
}

function IncidentDetails (props: { data?: IncidentDetailsProps }) {
  const data = props.data as IncidentDetailsProps
  const IncidentDetailsComponent = incidentDetailsMap[data?.code as keyof typeof incidentDetailsMap]
  return (
    <IncidentDetailsComponent {...data}/>
  )
}

const sample = {
  apCount: -1,
  isMuted: false,
  mutedBy: null,
  slaThreshold: null,
  clientCount: 27,
  path: [
    {
      type: 'system',
      name: 'Edu2-vSZ-52'
    },
    {
      type: 'zone',
      name: 'Edu2-611-Mesh'
    },
    {
      type: 'apGroup',
      name: '255_Edu2-611-group'
    },
    {
      type: 'ap',
      name: '70:CA:97:01:A0:C0'
    }
  ],
  endTime: '2022-07-20T02:42:00.000Z',
  vlanCount: -1,
  sliceType: 'ap',
  code: 'eap-failure',
  startTime: '2022-07-19T05:15:00.000Z',
  metadata: {
    dominant: {},
    rootCauseChecks: {
      checks: [
        {
          AP_MODEL: false,
          FW_VERSION: true,
          CLIENT_OS_MFG: false,
          CCD_REASON_DISASSOC_STA_HAS_LEFT: true
        }
      ],
      params: {
        FW_VERSION: '6.1.1.0.917'
      }
    }
  },
  id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
  impactedApCount: -1,
  switchCount: -1,
  currentSlaThreshold: null,
  severity: 0.674055825227442,
  connectedPowerDeviceCount: -1,
  mutedAt: null,
  impactedClientCount: 5,
  sliceValue: 'RuckusAP'
} as IncidentDetailsProps

function IncidentDetailsPage () {
  let { incidentId } = useParams()
  // const queryResults = useIncidentDetailsQuery({ id: incidentId })
  const queryResults = {
    states: 'fulfilled',
    isLoading: false,
    data: sample
  }
  return (
    <Loader states={[queryResults]}>
      <IncidentDetails data={queryResults.data}/>
    </Loader>
  )
}

export default IncidentDetailsPage
