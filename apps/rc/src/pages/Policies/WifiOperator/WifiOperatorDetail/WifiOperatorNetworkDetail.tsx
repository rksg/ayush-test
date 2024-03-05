import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Card, Table, TableProps }                                  from '@acx-ui/components'
import { SimpleListTooltip }                                        from '@acx-ui/rc/components'
import { useGetWifiOperatorListQuery, useWifiNetworkListQuery }     from '@acx-ui/rc/services'
import { NetworkType, NetworkTypeEnum, WifiNetwork, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                    from '@acx-ui/react-router-dom'

const defaultPayload = {
  fields: [
    'id',
    'name',
    'nwSubType',
    'venueApGroups'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25
}

const WifiOperatorNetworkDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { policyId } = params
  const [detailData, setDetailData] = useState<WifiNetwork[]>([])
  const [networkFilters, setNetworkFilters] = useState<{ id: string[] }>({ id: [] })

  const defaultWifiOperatorPayload = {
    fields: ['id', 'networkIds', 'friendlyNames', 'friendlyNameCount'],
    searchString: '',
    filters: { id: [policyId] }
  }

  const basicColumns: TableProps<WifiNetwork>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        return <TenantLink to={`networks/wireless/${row.id}/network-details/overview`}>
          {row.name}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      key: 'nwSubType',
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      key: 'venues',
      sorter: true,
      render: (_, row) => {
        if (!row.venueApGroups || row.venueApGroups?.length === 0) return 0

        return <SimpleListTooltip
          items={row.venueApGroups.map(v => v.venueId)}
          displayText={row.venueApGroups.length} />
      }
    }
  ]

  const { data } = useGetWifiOperatorListQuery({
    payload: {
      ...defaultWifiOperatorPayload
    }
  })

  const tableQuery = useTableQuery({
    useQuery: useWifiNetworkListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: { id: [] as string[] }
    },
    option: {
      skip: networkFilters.id.length == 0
    }
  })

  useEffect(()=>{

    if (!data)
      return

    const networkIdList = data?.data
      .filter(item => item.networkIds)
      .flatMap(policy => policy.networkIds) ?? []
    if (networkIdList && networkIdList.length > 0) {
      const newNetworkFilters = { id: networkIdList as string[] }
      setNetworkFilters(newNetworkFilters)
      tableQuery.setPayload({
        ...tableQuery.payload,
        filters: newNetworkFilters
      })
    }
  }, [data])

  useEffect(()=>{
    if (tableQuery.data?.data) {
      setDetailData(tableQuery.data?.data)
    }

  }, [tableQuery])

  return (
    <Card title={
      $t(
        { defaultMessage: 'Instances ({count})' },
        { count: detailData?.length ?? 0 }
      )
    }>
      <Table
        columns={basicColumns}
        dataSource={detailData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Card>
  )
}

export default WifiOperatorNetworkDetail
