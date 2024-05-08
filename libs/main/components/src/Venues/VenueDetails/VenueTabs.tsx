import { useIntl } from 'react-intl'

import { Tabs }                                                    from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                from '@acx-ui/feature-toggle'
import { useGetPropertyConfigsQuery, useGetPropertyUnitListQuery } from '@acx-ui/rc/services'
import {
  PropertyConfigStatus,
  useConfigTemplate,
  useConfigTemplateTenantLink,
  VenueDetailHeader
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes, WifiScopes }              from '@acx-ui/types'
import { hasPermission }                         from '@acx-ui/user'

function VenueTabs (props:{ venueDetail: VenueDetailHeader }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/venues/${params.venueId}/venue-details/`)
  const templateBasePath = useConfigTemplateTenantLink(`venues/${params.venueId}/venue-details/`)
  const navigate = useNavigate()
  const { isTemplate } = useConfigTemplate()
  const enabledServices = useIsSplitOn(Features.SERVICES)
  const isPropertyAvailable
    = useIsTierAllowed(Features.CLOUDPATH_BETA) && hasPermission({ scopes: [WifiScopes.READ] })
  const { data: unitQuery } = useGetPropertyUnitListQuery({
    params: { venueId: params.venueId },
    payload: {
      page: 1,
      pageSize: 10,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, { skip: !isPropertyAvailable || isTemplate })
  const propertyConfig = useGetPropertyConfigsQuery({ params }, {
    skip: !isPropertyAvailable || isTemplate
  })

  const onTabChange = (tab: string) => {
    if (isTemplate) {
      navigate({
        ...templateBasePath,
        pathname: `${templateBasePath.pathname}/${tab}`
      })
      return
    }

    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const data = props.venueDetail
  const [clientsCount, devicesCount, networksCount, unitCount] = [
    (data?.totalClientCount ? Number(data.totalClientCount) : 0) +
      (data?.switchClients?.totalCount ?? 0),
    (data?.aps?.totalApCount ?? 0) +
      (data?.switches?.totalCount ?? 0) +
      (data?.edges?.totalCount ?? 0),
    data?.activeNetworkCount ?? 0,
    unitQuery?.totalCount ?? 0
  ]

  const hasReadPermission
  = hasPermission({ scopes: [WifiScopes.READ, SwitchScopes.READ] })

  if (isTemplate) {
    return (
      <Tabs onChange={onTabChange} activeKey={params.activeTab}>
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Networks ({networksCount})' }, { networksCount })}
          key='networks'
        />
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Services' })}
          key='services'
        />
      </Tabs>
    )
  }

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      { hasPermission() && <Tabs.TabPane
        tab={$t({ defaultMessage: 'AI Analytics' })}
        key='analytics'
      /> }
      { hasReadPermission && <Tabs.TabPane
        tab={$t({ defaultMessage: 'Clients ({clientsCount})' }, { clientsCount })}
        key='clients'
      />}
      { hasReadPermission && <Tabs.TabPane
        tab={$t({ defaultMessage: 'Devices ({devicesCount})' }, { devicesCount })}
        key='devices'
      />}
      { hasPermission({ scopes: [WifiScopes.READ] }) && <Tabs.TabPane
        tab={$t({ defaultMessage: 'Networks ({networksCount})' }, { networksCount })}
        key='networks'
      />}
      {(isPropertyAvailable
          && !propertyConfig?.isError
          && propertyConfig?.currentData?.status === PropertyConfigStatus.ENABLED
      ) &&
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Property Units ({unitCount})' }, { unitCount })}
          key='units'
        />
      }
      {enabledServices ? <Tabs.TabPane
        tab={$t({ defaultMessage: 'Services' })}
        key='services'
      /> : null}
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default VenueTabs
