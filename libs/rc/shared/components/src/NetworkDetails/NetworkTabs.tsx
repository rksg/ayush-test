import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useNetworkDetailHeaderQuery }           from '@acx-ui/rc/services'
import { useConfigTemplate }                     from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import {
  getUserProfile,
  hasRaiPermission,
  isCoreTier
} from '@acx-ui/user'

function NetworkTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/networks/wireless/${params.networkId}/network-details/`)
  const navigate = useNavigate()
  const { isTemplate } = useConfigTemplate()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isWifiRbacEnabled

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const { tenantId, networkId } = params
  const { data } = useNetworkDetailHeaderQuery({
    params: { tenantId, networkId },
    payload: { isTemplate },
    enableRbac: resolvedRbacEnabled
  })

  const [apsCount, venuesCount] = [
    data?.aps?.totalApCount ?? 0,
    data?.activeVenueCount ?? 0
  ]

  if (isTemplate) {
    return (
      <Tabs onChange={onTabChange} activeKey={params.activeTab}>
        <Tabs.TabPane
          tab={$t({ defaultMessage: '<VenuePlural></VenuePlural> ({venuesCount})' },
            { venuesCount })}
          key='venues'
        />
      </Tabs>
    )
  }

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Overview' })}
        key='overview'
      />
      { (hasRaiPermission('READ_INCIDENTS') && !isCore) && <Tabs.TabPane
        tab={$t({ defaultMessage: 'Incidents' })}
        key='incidents'
      />
      }
      <Tabs.TabPane
        tab={$t({ defaultMessage: '<VenuePlural></VenuePlural> ({venuesCount})' },
          { venuesCount })}
        key='venues'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'APs ({apsCount})' }, { apsCount })}
        key='aps'
      />
      <Tabs.TabPane
        tab={
          $t({ defaultMessage: 'Clients ({clientsCount})' },
            { clientsCount: data?.network?.clients })
        }
        key='clients'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Timeline' })}
        key='timeline'
      />
    </Tabs>
  )
}

export default NetworkTabs
