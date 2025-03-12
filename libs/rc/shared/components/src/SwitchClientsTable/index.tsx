import { useContext } from 'react'

import { Filter }                                 from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { useSwitchListQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import { useParams }                              from '@acx-ui/react-router-dom'
import { getIntl, noDataDisplay }                 from '@acx-ui/utils'

import { authenticationTypeLabel, AuthenticationType } from '../FlexibleAuthentication'

import { ClientsTable }        from './ClientsTable'
import { SwitchClientContext } from './context'

function GetFilterable (filterByVenue: boolean, filterBySwitch: boolean, filters?: Filter) {
  const { tenantId, venueId } = useParams()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const filterable: { [k: string]: boolean | { key: string; value: string }[] } = {}

  const venueQueryTable = useVenuesListQuery({
    params: { tenantId }, payload: {
      fields: ['name', 'country', 'latitude', 'longitude', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, { skip: !filterByVenue })

  if (filterByVenue) {
    filterable.venueId = venueQueryTable?.data?.data.map(v => (
      { key: v.id, value: v.name })
    ) || true
  }

  const switchQueryTable = useSwitchListQuery({
    params: { tenantId },
    payload: {
      fields: ['name', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      filters: venueId
        ? { venueId: [venueId] }
        : filters?.venueId ? { venueId: filters?.venueId } : {}
    },
    enableRbac: isSwitchRbacEnabled
  }, { skip: !filterBySwitch })

  if (filterBySwitch) {
    filterable.switchId = switchQueryTable?.data?.data.map(v => (
      { key: v.id, value: v.name })
    ) || true
  }

  return filterable
}

export const getClientAuthType = (type?: string) => {
  const { $t } = getIntl()
  switch(type){
    case 'DOT1X':
      return $t(authenticationTypeLabel[AuthenticationType._802_1X])
    case 'MAC_AUTH':
      return $t(authenticationTypeLabel[AuthenticationType.MACAUTH])
    case 'WEB_AUTH':
      return $t({ defaultMessage: 'WEB-AUTH' })
    default:
      return noDataDisplay
  }
}

export function SwitchClientsTable (props : {
  filterByVenue?: boolean
  filterBySwitch?: boolean
}) {
  const { filterByVenue, filterBySwitch } = props
  const { tableQueryFilters } = useContext(SwitchClientContext)

  return (
    <div>
      <ClientsTable
        searchable={true}
        filterableKeys={GetFilterable(!!filterByVenue, !!filterBySwitch, tableQueryFilters)}
      />
    </div>
  )
}
