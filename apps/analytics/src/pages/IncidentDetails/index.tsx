import { IncidentDetailsProps } from '@acx-ui/analytics/utils'
import { Loader }               from '@acx-ui/components'
import { useParams }            from '@acx-ui/react-router-dom'

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

export function IncidentDetails (props: { data?: IncidentDetailsProps }) {
  const data = props.data as IncidentDetailsProps
  const IncidentDetailsComponent = incidentDetailsMap[data?.code as keyof typeof incidentDetailsMap]
  return (
    <IncidentDetailsComponent {...data}/>
  )
}

function IncidentDetailsPage () {
  let { incidentId } = useParams()
  const queryResults = useIncidentDetailsQuery({ id: incidentId })
  return (
    <Loader states={[queryResults]}>
      <IncidentDetails data={queryResults.data}/>
    </Loader>
  )
}

export default IncidentDetailsPage
