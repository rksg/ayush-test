import { useEffect, useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Button }                                                   from '@acx-ui/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { ApGroupTable, ApGroupsTabContext }                         from '@acx-ui/rc/components'
import { useApGroupsListQuery, useVenuesListQuery }                 from '@acx-ui/rc/services'
import { ApGroupViewModel, usePollingTableQuery, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { TenantLink }                                               from '@acx-ui/react-router-dom'
import { WifiScopes }                                               from '@acx-ui/types'
import { getOpsApi }                                                from '@acx-ui/utils'


export default function useApGroupsTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const [ apGroupsCount, setApGroupsCount ] = useState(0)

  const { venueFilterOptions } = useVenuesListQuery(
    {
      params: { tenantId },
      payload: {
        fields: ['name', 'id'],
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC'
      }
    },
    {
      selectFromResult: ({ data }) => ({
        venueFilterOptions: data?.data.map(v=>({ key: v.id, value: v.name })) || true
      })
    }
  )

  const apGroupListTableQuery = usePollingTableQuery<ApGroupViewModel>({
    useQuery: useApGroupsListQuery,
    defaultPayload: {
      fields: ['id', 'name'],
      filters: { isDefault: [false] }
    },
    enableRbac: isWifiRbacEnabled
  })

  useEffect(() => {
    setApGroupsCount(apGroupListTableQuery.data?.totalCount!)
  }, [apGroupListTableQuery.data])

  const title = defineMessage({
    defaultMessage: 'AP Group List {count, select, null {} other {({count})}}',
    description: 'Translation strings - AP Group List'
  })

  const extra = [
    <TenantLink to='devices/apgroups/add'
      scopeKey={[WifiScopes.CREATE]}
      rbacOpsIds={[getOpsApi(WifiRbacUrlsInfo.addApGroup)]}>
      <Button type='primary'>
        {$t({ defaultMessage: 'Add' })}
      </Button>
    </TenantLink>
  ]


  const component = (
    <ApGroupsTabContext.Provider value={{ setApGroupsCount }}>
      <ApGroupTable
        searchable={true}
        filterables={{
          venueId: venueFilterOptions
        }}
        rowSelection={{
          type: 'checkbox'
        }}
      />
    </ApGroupsTabContext.Provider>
  )


  return {
    title: $t(title, { count: apGroupsCount || 0 }),
    headerExtra: extra,
    component
  }
}