/* eslint-disable max-len */
import _ from 'lodash'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetNetworkDeepQuery,
  useGetNetworkDeepTemplateQuery,
  useGetNetworkQuery,
  useGetOnboardConfigsQuery
} from '@acx-ui/rc/services'
import { useConfigTemplate } from '@acx-ui/rc/utils'
import { useParams }         from '@acx-ui/react-router-dom'

export function useGetNetwork ( props?: {
  gptEditId?: string,
  isGptMode?: boolean
}) {
  const { gptEditId, isGptMode } = props || {}
  const { isTemplate } = useConfigTemplate()
  const wifiRbacApiEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const configTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)

  const isWifiRbacEnabled = isGptMode ? false : wifiRbacApiEnabled
  const isConfigTemplateRbacEnabled = isGptMode ? false : configTemplateRbacEnabled
  const params = useParams()

  const networkResult = useGetNetworkQuery({ params, enableRbac: isWifiRbacEnabled }, { skip: isTemplate || isWifiRbacEnabled || isGptMode })
  const gptNetworkResult = useGetOnboardConfigsQuery({ params: { id: gptEditId } }, { skip: _.isEmpty(gptEditId) })
  const rbacNetworkResult = useGetNetworkDeepQuery({ params, enableRbac: isWifiRbacEnabled }, { skip: isTemplate || !isWifiRbacEnabled })
  const rbacNetworkResultTemplate = useGetNetworkDeepTemplateQuery({ params, enableRbac: isConfigTemplateRbacEnabled }, { skip: !isTemplate })

  if(!_.isEmpty(gptEditId)) {
    return gptNetworkResult
  }

  return isTemplate
    ? rbacNetworkResultTemplate
    : (isWifiRbacEnabled ? rbacNetworkResult : networkResult)
}

export function extractSSIDFilter (network: ReturnType<typeof useGetNetworkQuery>) {
  const ssid = network.data?.wlan?.ssid
  return ssid ? [ssid] : []
}
