import { Loader }    from '@acx-ui/components'
import { useParams } from '@acx-ui/react-router-dom'

import Assoc                       from './Details/Assoc'
import Auth                        from './Details/Auth'
import Dhcp                        from './Details/Dhcp'
import Eap                         from './Details/Eap'
import Radius                      from './Details/Radius'
import { useIncidentDetailsQuery } from './services'

export const incidentDetailsMap = {
  'radius-failure': Radius,
  'dhcp-failure': Dhcp,
  'eap-failure': Eap,
  'auth-failure': Auth,
  'assoc-failure': Assoc
}

function IncidentDetails () {
  let code, incident
  let { incidentId } = useParams()
  const results = useIncidentDetailsQuery({ id: incidentId })
  if (results.status === 'fulfilled') {
    incident = results.data
    code = results.data.incident.code
    const IncidentDetail = incidentDetailsMap[code as keyof typeof incidentDetailsMap]
    return <IncidentDetail {...incident}/> 
  } else {
    return <Loader states={[{ isLoading: true }]}/>
  }
}

export default IncidentDetails
