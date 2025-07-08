import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Card, Table, TableProps }                              from '@acx-ui/components'
import { useGetWifiOperatorListQuery, useWifiNetworkListQuery } from '@acx-ui/rc/services'
import { NetworkType, NetworkTypeEnum, WifiNetwork }            from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                from '@acx-ui/react-router-dom'
import { useTableQuery }                                        from '@acx-ui/utils'

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
    fields: ['id', 'wifiNetworkIds', 'friendlyNames', 'friendlyNameCount'],
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
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venues',
      key: 'venues',
      sorter: true,
      render: (_, row) => {
        const venueCount = row.venueApGroups?.length
        return <TenantLink
          to={`/networks/wireless/${row.id}/network-details/venues`}
          children={venueCount || 0}
        />
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
      skip: !(networkFilters?.id?.length)
    }
  })

  useEffect(()=>{

    if (!data)
      return

    const wifiNetworkIdList = data?.data
      .filter(item => item.wifiNetworkIds)
      .flatMap(policy => policy.wifiNetworkIds) ?? []
    if (wifiNetworkIdList && wifiNetworkIdList.length > 0) {
      const newWifiNetworkFilters = { id: wifiNetworkIdList as string[] }
      setNetworkFilters(newWifiNetworkFilters)
      tableQuery.setPayload({
        ...tableQuery.payload,
        filters: newWifiNetworkFilters
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
