/* eslint-disable max-len */
import { Features, useIsSplitOn }                                                 from '@acx-ui/feature-toggle'
import { useGetNetworkDeepQuery, useGetNetworkQuery, useGetNetworkTemplateQuery } from '@acx-ui/rc/services'
import { useConfigTemplate }                                                      from '@acx-ui/rc/utils'
import { useParams }                                                              from '@acx-ui/react-router-dom'

export function useGetNetwork () {
  const { isTemplate } = useConfigTemplate()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const params = useParams()

  const networkResult = useGetNetworkQuery({ params, enableRbac: isWifiRbacEnabled }, { skip: isTemplate || isWifiRbacEnabled })
  const rbacNetworkResult = useGetNetworkDeepQuery({ params, enableRbac: isWifiRbacEnabled }, { skip: isTemplate || !isWifiRbacEnabled })

  const networkTemplateResult = useGetNetworkTemplateQuery({ params, enableRbac: isConfigTemplateRbacEnabled }, { skip: !isTemplate })
  return isTemplate ? networkTemplateResult : (isWifiRbacEnabled ? rbacNetworkResult: networkResult)
}

export function extractSSIDFilter (network: ReturnType<typeof useGetNetworkQuery>) {
  const ssid = network.data?.wlan?.ssid
  return ssid ? [ssid] : []
}
