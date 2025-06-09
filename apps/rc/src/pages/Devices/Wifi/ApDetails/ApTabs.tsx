/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Tabs }                                             from '@acx-ui/components'
import { Features, useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { ApDetailHeader, ApDeviceStatusEnum, useApContext } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                       from '@acx-ui/react-router-dom'
import { getUserProfile, hasRaiPermission, isCoreTier }     from '@acx-ui/user'

function ApTabs (props:{ apDetail: ApDetailHeader }) {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const params = useApContext()
  const basePath = useTenantLink(`/devices/wifi/${params.serialNumber}/details/`)
  const navigate = useNavigate()
  const isSupportWifiWiredClient = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)

  const onTabChange = (tab: string) => {
    if (tab === 'troubleshooting') tab = `${tab}/ping`
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  const { apDetail } = props
  const { overview, networks, clients=0, apWiredClients=0 } = apDetail?.headers ?? {}
  const currentApOperational = (overview === ApDeviceStatusEnum.OPERATIONAL)
  const clientCount = isSupportWifiWiredClient? (clients + apWiredClients) : clients

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      { (hasRaiPermission('READ_INCIDENTS') && !isCore) &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'AI Analytics' })} key='analytics' /> }
      {currentApOperational &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Troubleshooting' })}
          key='troubleshooting' />}
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Neighbors' })}
        key='neighbors'
      />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Reports' })}
        key='reports'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Networks ({networksCount})' }, { networksCount: networks })}
        key='networks'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Clients ({clientsCount})' }, { clientsCount: clientCount })}
        key='clients'
      />
      {/* Not supported for GA
      isFFOn ? <Tabs.TabPane
        tab={$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount: apDetail?.headers?.services || 0 })}
        key='services'
      /> : null */}
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Timeline' })}
        key='timeline'
      />
    </Tabs>
  )
}

export default ApTabs
