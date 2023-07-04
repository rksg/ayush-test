import { useEffect, useRef, useState } from 'react'

import { Menu, MenuProps }        from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  Button,
  Dropdown
} from '@acx-ui/components'
import { ApTable, ApTableRefType, ApsTabContext, defaultApPayload, groupedFields } from '@acx-ui/rc/components'
import {
  useApGroupsListQuery,
  useApListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import { usePollingTableQuery }  from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

export default function useApsTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [ apsCount, setApsCount ] = useState(0)
  const apTableRef = useRef<ApTableRefType>(null)

  const { venueFilterOptions } = useVenuesListQuery(
    {
      params: { tenantId },
      payload: {
        fields: ['name', 'country', 'latitude', 'longitude', 'id'],
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC'
      }
    },
    {
      selectFromResult: ({ data }) => ({
        venueFilterOptions: data?.data.map(v=>({ key: v.id, value: v.name })) || true
      })
    })
  const { apgroupFilterOptions } = useApGroupsListQuery(
    {
      params: { tenantId },
      payload: {
        fields: ['name', 'venueId', 'clients', 'networks', 'venueName', 'id'],
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC',
        filters: { isDefault: [false] }
      }
    },
    {
      selectFromResult: ({ data }) => ({
        apgroupFilterOptions: data?.data.map((v) => ({ key: v.id, value: v.name })) || true
      })
    }
  )

  const apListTableQuery = usePollingTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultApPayload,
      groupByFields: groupedFields
    }
  })

  useEffect(() => {
    setApsCount(apListTableQuery.data?.totalCount!)
  }, [apListTableQuery.data])

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'import-from-file') {
      apTableRef.current?.openImportDrawer()
    }
  }

  const addMenu = <Menu
    onClick={handleMenuClick}
    items={[{
      key: 'ap',
      label: <TenantLink to='devices/wifi/add'>{$t({ defaultMessage: 'AP' })}</TenantLink>
    }, {
      key: 'import-from-file',
      label: $t({ defaultMessage: 'Import from file' })
    }, {
      key: 'ap-group',
      label: <TenantLink to='devices/apgroups/add'>
        {$t({ defaultMessage: 'AP Group' })}</TenantLink> }
    ]}
  />

  const title = defineMessage({
    defaultMessage: 'AP List {count, select, null {} other {({count})}}',
    description: 'Translation strings - AP List'
  })

  const extra = [
    <Dropdown overlay={addMenu} key='add'>{() =>
      <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
    }</Dropdown>
  ]

  const component =
    <ApsTabContext.Provider value={{ setApsCount }}>
      <ApTable ref={apTableRef}
        searchable={true}
        filterables={{
          venueId: venueFilterOptions,
          deviceGroupId: apgroupFilterOptions
        }}
        rowSelection={{
          type: 'checkbox'
        }}
      />
    </ApsTabContext.Provider>

  return {
    title: $t(title, { count: apsCount || 0 }),
    headerExtra: extra,
    component
  }
}
