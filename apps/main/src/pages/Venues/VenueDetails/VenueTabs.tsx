import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useGetPropertyUnitListQuery }           from '@acx-ui/rc/services'
import { VenueDetailHeader }                     from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function VenueTabs (props:{ venueDetail: VenueDetailHeader }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/venues/${params.venueId}/venue-details/`)
  const navigate = useNavigate()
  const enabledServices = useIsSplitOn(Features.SERVICES)
  const enableMacRegistration = useIsSplitOn(Features.MAC_REGISTRATION)
  const enablePersona = useIsSplitOn(Features.PERSONA) && enableMacRegistration
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
        tab={$t({ defaultMessage: 'AI Analytics' })}
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
      {enableProperty ? <Tabs.TabPane
        tab={$t({ defaultMessage: 'Property Units ({unitCount})' }, { unitCount })}
        key='units'
      /> : null}
      {enabledServices ? <Tabs.TabPane
        tab={$t({ defaultMessage: 'Services' })}
        key='services'
      /> : null}
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default VenueTabs
