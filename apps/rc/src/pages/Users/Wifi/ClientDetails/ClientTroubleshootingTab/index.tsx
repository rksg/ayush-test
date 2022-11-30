
import { useParams }             from '@acx-ui/react-router-dom'

import { ClientTroubleshooting } from '@acx-ui/analytics/components'


export function ClientTroubleshootingTab () {
  
  const { clientId }  = useParams()
  
  return <ClientTroubleshooting clientMac={(clientId as string ?? '').toUpperCase()} />
   
}
