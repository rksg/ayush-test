import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import { useGetNetworkQuery, useGetNetworkTemplateQuery } from '@acx-ui/rc/services'
import { useConfigTemplate }                              from '@acx-ui/rc/utils'
import { useParams }                                      from '@acx-ui/react-router-dom'

export function useGetNetwork () {
  const { isTemplate } = useConfigTemplate()
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)

  const { tenantId, networkId } = useParams()
  // eslint-disable-next-line max-len
  const networkResult = useGetNetworkQuery({ params: { tenantId, networkId } }, { skip: isTemplate })
  // eslint-disable-next-line max-len
  const networkTemplateResult = useGetNetworkTemplateQuery({
    params: { tenantId, networkId },
    enableRbac: isConfigTemplateRbacEnabled
  }, { skip: !isTemplate })
  return isTemplate ? networkTemplateResult : networkResult
}

export function extractSSIDFilter (network: ReturnType<typeof useGetNetworkQuery>) {
  const ssid = network.data?.wlan?.ssid
  return ssid ? [ssid] : []
}
