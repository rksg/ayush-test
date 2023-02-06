import { useGetNetworkQuery } from '@acx-ui/rc/services'
import { useParams }          from '@acx-ui/react-router-dom'

export function useGetNetwork () {
  const { tenantId, networkId } = useParams()
  return useGetNetworkQuery({ params: { tenantId, networkId } })
}

export function getSSIDFilter () {
  const network = useGetNetwork()
  const ssid  = network.data?.wlan?.ssid
  return ssid ? [ssid] : []
}