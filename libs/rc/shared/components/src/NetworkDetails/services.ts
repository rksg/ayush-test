/* eslint-disable max-len */
import _ from 'lodash'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetNetworkDeepQuery,
  useGetNetworkDeepTemplateQuery,
  useGetNetworkDeepTemplateV2Query,
  useGetNetworkDeepV2Query,
  useGetNetworkQuery,
  useGetOnboardConfigsQuery
} from '@acx-ui/rc/services'
import { useConfigTemplate } from '@acx-ui/rc/utils'
import { useParams }         from '@acx-ui/react-router-dom'

export function useGetNetwork ( props?: {
  gptEditId?: string,
  isRuckusAiMode?: boolean
}) {
  const { gptEditId, isRuckusAiMode } = props || {}
  const { isTemplate } = useConfigTemplate()
  const wifiRbacApiEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const configTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isUseNewRbacNetworkVenueApi = useIsSplitOn(Features.WIFI_NETWORK_VENUE_QUERY)

  const isWifiRbacEnabled = isRuckusAiMode ? false : wifiRbacApiEnabled
  const isConfigTemplateRbacEnabled = isRuckusAiMode ? false : configTemplateRbacEnabled
  const params = useParams()

  // non - RBAC API
  const networkResult = useGetNetworkQuery({ params, enableRbac: isWifiRbacEnabled }, { skip: isTemplate || isWifiRbacEnabled || isRuckusAiMode })
  const gptNetworkResult = useGetOnboardConfigsQuery({ params: { id: gptEditId } }, { skip: _.isEmpty(gptEditId) })

  // RBAC API
  const rbacNetworkResult = useGetNetworkDeepQuery({ params, enableRbac: isWifiRbacEnabled }, { skip: isTemplate || !isWifiRbacEnabled || isUseNewRbacNetworkVenueApi })
  const rbacNetworkResultTemplate = useGetNetworkDeepTemplateQuery({ params, enableRbac: isConfigTemplateRbacEnabled }, { skip: !isTemplate || isUseNewRbacNetworkVenueApi })

  // Enhance RBAC API
  const rbacNetworkV2Result = useGetNetworkDeepV2Query({ params, enableRbac: isWifiRbacEnabled }, { skip: isTemplate || !isWifiRbacEnabled || !isUseNewRbacNetworkVenueApi })
  const rbacNetworkV2ResultTemplate = useGetNetworkDeepTemplateV2Query({ params, enableRbac: isConfigTemplateRbacEnabled }, { skip: !isTemplate || !isUseNewRbacNetworkVenueApi })


  if(!_.isEmpty(gptEditId)) {
    return gptNetworkResult
  }

  return isTemplate
    ? (isUseNewRbacNetworkVenueApi? rbacNetworkV2ResultTemplate: rbacNetworkResultTemplate)
    : (isWifiRbacEnabled ? (isUseNewRbacNetworkVenueApi? rbacNetworkV2Result : rbacNetworkResult) : networkResult)
}

export function extractSSIDFilter (network: ReturnType<typeof useGetNetworkQuery>) {
  const ssid = network.data?.wlan?.ssid
  return ssid ? [ssid] : []
}
