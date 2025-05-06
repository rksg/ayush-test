import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }         from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { useApListQuery, useGetVenuesQuery } from '@acx-ui/rc/services'
import { AP, useTableQuery }                 from '@acx-ui/rc/utils'
import { TenantLink, useParams }             from '@acx-ui/react-router-dom'

interface ApTableProps {
  apSerialNumbers: string[]
}

export const ApTable = (props: ApTableProps) => {
  const { $t } = useIntl()
  const { apSerialNumbers } = props
  const { tenantId } = useParams()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const [isApNumbersLoading, setIsApNumbersLoading ] = useState(true)
  const defaultTablePayload = {
    fields: [
      'name',
      'venueId',
      'model',
      'serialNumber',
      'venueName'
    ],
    filters: { serialNumber: apSerialNumbers }
  }

  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: defaultTablePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {},
    enableRbac: isWifiRbacEnabled,
    option: {
      skip: isApNumbersLoading
    }
  })

  useEffect(()=>{
    if(apSerialNumbers.length > 0) {

      tableQuery.setPayload({ ...tableQuery.payload, filters: { serialNumber: apSerialNumbers } })
      setIsApNumbersLoading(false)
    }

  }, [apSerialNumbers])

  const emptyVenues: { key: string, value: string }[] = []
  const { venueNameMap } = useGetVenuesQuery({
    params: { tenantId: tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueNameMap: data?.data
        ? data.data.map(venue => ({ key: venue.id, value: venue.name }))
        : emptyVenues
    })
  })

  const columns: TableProps<AP>['columns'] =[
    {
      title: $t({ defaultMessage: 'AP Name' }),
      key: 'name',
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        return (
          <TenantLink to={'/devices/wifi/'+row.serialNumber+'/details/overview'}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model'
    }, {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueId',
      key: 'venueId',
      sorter: true,
      filterable: venueNameMap,
      render: (_, row) => {
        return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      }
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table<AP>
        rowKey='name'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
      />
    </Loader>
  )
}
