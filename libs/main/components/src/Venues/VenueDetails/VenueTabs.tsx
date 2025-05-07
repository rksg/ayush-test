import { useIntl } from 'react-intl'

import { Tabs }                                                                     from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                 from '@acx-ui/feature-toggle'
import { useGetPropertyConfigsQuery, useGetPropertyUnitListQuery, useRwgListQuery } from '@acx-ui/rc/services'
import {
  PropertyConfigStatus,
  useConfigTemplate,
  useConfigTemplateTenantLink,
  VenueDetailHeader
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                         from '@acx-ui/react-router-dom'
import { RolesEnum }                                                     from '@acx-ui/types'
import { hasRaiPermission, hasRoles, isCoreTier, useUserProfileContext } from '@acx-ui/user'

function VenueTabs (props:{ venueDetail: VenueDetailHeader }) {
  const { $t } = useIntl()
  const params = useParams()
  const { isCustomRole, accountTier } = useUserProfileContext()
  const basePath = useTenantLink(`/venues/${params.venueId}/venue-details/`)
  const templateBasePath = useConfigTemplateTenantLink(`venues/${params.venueId}/venue-details/`)
  const navigate = useNavigate()
  const { isTemplate } = useConfigTemplate()
  const isCore = isCoreTier(accountTier)
  const enableProperty = useIsTierAllowed(Features.CLOUDPATH_BETA) && !isCore
  const { data: unitQuery } = useGetPropertyUnitListQuery({
    params: { venueId: params.venueId },
    payload: {
      page: 1,
      pageSize: 10,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, { skip: !enableProperty || isTemplate })
  const propertyConfig = useGetPropertyConfigsQuery({ params }, {
    skip: !enableProperty || isTemplate
  })

  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)
  const rwgHasPermission = hasRoles([RolesEnum.PRIME_ADMIN,
    RolesEnum.ADMINISTRATOR,
    RolesEnum.READ_ONLY]) || isCustomRole
  const { data: rwgs } = useRwgListQuery({ params: useParams() },
    { skip: !(showRwgUI && rwgHasPermission) })

  const onTabChange = (tab: string) => {
    if (isTemplate) {
      navigate({
        ...templateBasePath,
        pathname: `${templateBasePath.pathname}/${tab}`
      })
      return
    }

    if (tab === 'clients') {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${tab}/wifi`
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
      (data?.edges?.totalCount ?? 0)
      + (rwgs?.totalCount ?? 0),
    data?.activeNetworkCount ?? 0,
    unitQuery?.totalCount ?? 0
  ]

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
      { (hasRaiPermission('READ_INCIDENTS') && !isCore) && <Tabs.TabPane
        tab={$t({ defaultMessage: 'AI Analytics' })}
        key='analytics'
      /> }
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
      {(enableProperty
          && !propertyConfig?.isError
          && propertyConfig?.currentData?.status === PropertyConfigStatus.ENABLED
      ) &&
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Property Units ({unitCount})' }, { unitCount })}
          key='units'
        />
      }
      <Tabs.TabPane tab={$t({ defaultMessage: 'Services' })} key='services' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default VenueTabs
