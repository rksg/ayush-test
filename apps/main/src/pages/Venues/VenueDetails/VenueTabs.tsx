import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { Features, useSplitTreatment }           from '@acx-ui/feature-toggle'
import { VenueDetailHeader }                     from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { notAvailableMsg }                       from '@acx-ui/utils'

function VenueTabs (props:{ venueDetail: VenueDetailHeader }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/venues/${params.venueId}/venue-details/`)
  const navigate = useNavigate()
  const enableVenueAnalytics = !useSplitTreatment(Features.VENUE_ANALYTICS)

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const data = props.venueDetail
  const [clientsCount, devicesCount, networksCount, servicesCount] = [
    data?.totalClientCount ?? 0,
    (data?.aps?.totalApCount ?? 0) + (data?.switches?.totalCount ?? 0),
    data?.activeNetworkCount ?? 0,
    0
  ]

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      <Tabs.TabPane
        disabled={enableVenueAnalytics}
        tab={<Tooltip title={$t(notAvailableMsg)}>
          {$t({ defaultMessage: 'AI Analytics' })}
        </Tooltip>}
        key='analytics'
      />
      <Tabs.TabPane
        disabled
        tab={<Tooltip title={$t(notAvailableMsg)}>
          {$t({ defaultMessage: 'Clients ({clientsCount})' }, { clientsCount })}
        </Tooltip>}
        key='clients'
      />
      <Tabs.TabPane
        disabled
        tab={<Tooltip title={$t(notAvailableMsg)}>
          {$t({ defaultMessage: 'Devices ({devicesCount})' }, { devicesCount })}
        </Tooltip>}
        key='devices'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Networks ({networksCount})' }, { networksCount })}
        key='networks'
      />
      <Tabs.TabPane
        disabled
        tab={<Tooltip title={$t(notAvailableMsg)}>
          {$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount })}
        </Tooltip>}
        key='services'
      />
      <Tabs.TabPane
        disabled
        tab={<Tooltip title={$t(notAvailableMsg)}>
          {$t({ defaultMessage: 'Timeline' })}
        </Tooltip>}
        key='timeline'
      />
    </Tabs>
  )
}

export default VenueTabs
