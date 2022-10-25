import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useVenueDetailsHeaderQuery }            from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function ApTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/devices/aps/${params.apId}/details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const { data } = useVenueDetailsHeaderQuery({ params })

  const [clientsCount, networksCount, servicesCount] = [
    data?.totalClientCount ?? 0,
    (data?.aps?.totalApCount ?? 0) + (data?.switches?.totalCount ?? 0),
    data?.activeNetworkCount ?? 0,
    0
  ]

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'AI Analytics' })} key='analytics' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Troubleshooting' })} key='troubleshooting' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Reports' })} key='reports' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Networks ({networksCount})' }, { networksCount })}
        key='networks'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Clients ({clientsCount})' }, { clientsCount })}
        key='clients'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount })}
        key='services'
      />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default ApTabs
