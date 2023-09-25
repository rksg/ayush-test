import { ClientTroubleshooting } from '@acx-ui/analytics/components'
import { useParams }             from '@acx-ui/react-router-dom'

export function ClientTroubleshootingTab () {
  const { clientId } = useParams()
  return <ClientTroubleshooting clientMac={(clientId as string).toUpperCase()} />
}
