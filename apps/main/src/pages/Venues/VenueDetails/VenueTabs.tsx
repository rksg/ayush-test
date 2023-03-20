import { useIntl } from 'react-intl'

import { Tooltip }                               from '@acx-ui/components'
import { Tabs }                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useGetPropertyUnitListQuery }           from '@acx-ui/rc/services'
import { VenueDetailHeader }                     from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { notAvailableMsg }                       from '@acx-ui/utils'

function VenueTabs (props:{ venueDetail: VenueDetailHeader }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/venues/${params.venueId}/venue-details/`)
  const navigate = useNavigate()
  const enableVenueAnalytics = useIsSplitOn(Features.VENUE_ANALYTICS)
  const enabledServices = useIsSplitOn(Features.SERVICES)
  const enablePersona = useIsSplitOn(Features.PERSONA)
  const enableProperty = useIsSplitOn(Features.PROPERTY_MANAGEMENT) && enablePersona
  const { data: unitQuery } = useGetPropertyUnitListQuery({
    params: { venueId: params.venueId },
    payload: {
      page: 1,
      pageSize: 10,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, { skip: !enableProperty })

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const data = props.venueDetail
  const [clientsCount, devicesCount, networksCount, unitCount] = [
    (data?.totalClientCount ? Number(data.totalClientCount) : 0) +
      (data?.switchClients?.totalCount ?? 0),
    (data?.aps?.totalApCount ?? 0) + (data?.switches?.totalCount ?? 0),
    data?.activeNetworkCount ?? 0,
    unitQuery?.totalCount ?? 0
  ]

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      <Tabs.TabPane
        disabled={!enableVenueAnalytics}
        tab={<Tooltip {...enableVenueAnalytics ? {} : { title: $t(notAvailableMsg) }}>
          {$t({ defaultMessage: 'AI Analytics' })}
        </Tooltip>}
        key='analytics'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Clients ({clientsCount})' }, { clientsCount })}
        key='clients'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Devices ({devicesCount})' }, { devicesCount })}
        key='devices'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Networks ({networksCount})' }, { networksCount })}
        key='networks'
      />
      <Tabs.TabPane
        // FIXME: If property enable or not
        disabled={!enableProperty}
        tab={enableProperty
          ? $t({ defaultMessage: 'Property Units ({unitCount})' }, { unitCount })
          : <Tooltip title={$t(notAvailableMsg)}>
            {$t({ defaultMessage: 'Property Units' })}
          </Tooltip>}
        key='units'
      />
      <Tabs.TabPane
        disabled={!enabledServices}
        tab={enabledServices
          ? $t({ defaultMessage: 'Services' })
          : <Tooltip title={$t(notAvailableMsg)}>{$t({ defaultMessage: 'Services' })}</Tooltip>}
        key='services'
      />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default VenueTabs
