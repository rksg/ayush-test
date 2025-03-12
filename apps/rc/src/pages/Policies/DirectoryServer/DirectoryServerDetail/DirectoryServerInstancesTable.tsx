import { useEffect, useState } from 'react'

import { FormattedMessage, useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                                 from '@acx-ui/components'
import { useGetDirectoryServerViewDataListQuery, useWifiNetworkListQuery } from '@acx-ui/rc/services'
import {
  captiveNetworkTypes, GuestNetworkTypeEnum, Network,
  NetworkTypeEnum, networkTypes, useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

export function DirectoryServerInstancesTable () {
  const { $t } = useIntl()

  const tableQuery = useDirectoryServerInstancesQuery()

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: function (_, row,__,highlightFn) {
        // eslint-disable-next-line max-len
        return <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>{highlightFn(row.name)}</TenantLink>
      }
    },
    {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => {
        const message = networkTypes[row.nwSubType.toLowerCase() as NetworkTypeEnum]
        return row.nwSubType.toLowerCase() === 'guest'
          ? <FormattedMessage
            defaultMessage={'Captive Portal - {captiveNetworkType}'}
            values={{
              captiveNetworkType: $t(captiveNetworkTypes[
                GuestNetworkTypeEnum[row.captiveType as keyof typeof GuestNetworkTypeEnum] ||
                GuestNetworkTypeEnum.Cloudpath
              ])
            }}
          />
          : <FormattedMessage {...message}/>
      }
    }
  ]
  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.totalCount })}>
        <Table
          columns={columns}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          dataSource={tableQuery.data?.data}
          rowKey='id'
          onFilterChange={tableQuery.handleFilterChange}
        />
      </Card>
    </Loader>
  )
}


function useDirectoryServerInstancesQuery () {
  const params = useParams()
  const { data: directoryServerViewData } = useGetDirectoryServerViewDataListQuery({
    payload: { filters: { id: [ params?.policyId ] } }
  })
  const [ directoryServerDataReady, setDirectoryServerDataReady ] = useState(false)
  const tableQuery = useTableQuery<Network>({
    useQuery: useWifiNetworkListQuery,
    defaultPayload: {
      fields: ['name', 'id', 'captiveType', 'nwSubType']
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 10000
    },
    search: {
      searchTargetFields: ['name'],
      searchString: ''
    },
    option: {
      skip: !directoryServerDataReady
    }
  })

  useEffect(() => {
    if (!directoryServerViewData) return

    const networkIds = directoryServerViewData.data[0]?.wifiNetworkIds ?? []

    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { id: networkIds.length > 0 ? networkIds : ['NO_NETWORK'] }
    })

    setDirectoryServerDataReady(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directoryServerViewData])

  return tableQuery
}
