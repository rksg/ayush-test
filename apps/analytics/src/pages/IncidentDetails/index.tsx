import React from 'react'

import { Loader } from '@acx-ui/components'

import Assoc           from './Details/Assoc'
import Auth            from './Details/Auth'
import Dhcp            from './Details/Dhcp'
import Eap             from './Details/Eap'
import Radius          from './Details/Radius'
import { useIncident } from './services'

export const incidentDetailsMap = {
  'radius-failure': Radius,
  'dhcp-failure': Dhcp,
  'eap-failure': Eap,
  'auth-failure': Auth,
  'assoc-failure': Assoc
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
