/* eslint-disable max-len */
import { useState, useEffect } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { Button }                                                                            from '@acx-ui/components'
import { Features, useIsSplitOn }                                                            from '@acx-ui/feature-toggle'
import { NetworkTabContext, NetworkTable, defaultNetworkPayload, defaultRbacNetworkPayload } from '@acx-ui/rc/components'
import { useEnhanceWifiNetworkTableQuery, useNetworkTableQuery, useWifiNetworkTableQuery }   from '@acx-ui/rc/services'
import {
  ConfigTemplateUrlsInfo,
  Network,
  useConfigTemplate,
  usePollingTableQuery,
  WifiNetwork,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink }                                                     from '@acx-ui/react-router-dom'
import { WifiScopes }                                                     from '@acx-ui/types'
import { getUserProfile, hasAllowedOperations, hasCrossVenuesPermission } from '@acx-ui/user'
import { getOpsApi }                                                      from '@acx-ui/utils'

export default function useNetworksTable () {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)

  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const { rbacOpsApiEnabled } = getUserProfile()

  const [ networkCount, setNetworkCount ] = useState(0)

  const settingsId = 'network-table'
  const tableQuery = usePollingTableQuery<Network|WifiNetwork>({
    useQuery: isApCompatibilitiesByModel? useEnhanceWifiNetworkTableQuery : (isWifiRbacEnabled? useWifiNetworkTableQuery : useNetworkTableQuery),
    defaultPayload: (isApCompatibilitiesByModel || isWifiRbacEnabled)? defaultRbacNetworkPayload : defaultNetworkPayload,
    pagination: { settingsId }
  })

  useEffect(() => {
    setNetworkCount(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])

  const title = defineMessage({
    defaultMessage: 'Network List {count, select, null {} other {({count})}}',
    description: 'Translation strings - Network List'
  })

  const addNetworkOpsApi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.addNetworkTemplateRbac
    : WifiRbacUrlsInfo.addNetworkDeep)

  const hasAddNetworkPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([addNetworkOpsApi])
    : hasCrossVenuesPermission()

  const extra = hasAddNetworkPermission? [
    <TenantLink to='/networks/wireless/add'
      scopeKey={[WifiScopes.CREATE]}>
      <Button type='primary'>{ $t({ defaultMessage: 'Add Wi-Fi Network' }) }</Button>
    </TenantLink>
  ] : []

  const component = <NetworkTabContext.Provider value={{ setNetworkCount }}>
    <NetworkTable tableQuery={tableQuery} selectable={true} settingsId={settingsId} />
  </NetworkTabContext.Provider>

  return {
    title: $t(title, { count: networkCount }),
    headerExtra: extra,
    component
  }
}
