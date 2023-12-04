import { useEffect, useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Button }                                                  from '@acx-ui/components'
import { ApGroupTable, ApGroupsTabContext, defaultApGroupPayload } from '@acx-ui/rc/components'
import { useApGroupsListQuery, useVenuesListQuery }                from '@acx-ui/rc/services'
import { usePollingTableQuery }                                    from '@acx-ui/rc/utils'
import { TenantLink }                                              from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'


export default function useApGroupsTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
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

  const apGroupListTableQuery = usePollingTableQuery({
    useQuery: useApGroupsListQuery,
    defaultPayload: {
      ...defaultApGroupPayload
    }
  })

  useEffect(() => {
    setApGroupsCount(apGroupListTableQuery.data?.totalCount!)
  }, [apGroupListTableQuery.data])

  const title = defineMessage({
    defaultMessage: 'AP Group List {count, select, null {} other {({count})}}',
    description: 'Translation strings - AP Group List'
  })

  const extra = filterByAccess([
    <TenantLink to='devices/apgroups/add'>
      <Button type='primary'>
        {$t({ defaultMessage: 'Add' })}
      </Button>
    </TenantLink>
  ])


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