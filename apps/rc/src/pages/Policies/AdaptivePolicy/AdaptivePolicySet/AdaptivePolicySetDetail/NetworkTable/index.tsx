import React, { useEffect } from 'react'

import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  Card
} from '@acx-ui/components'
import {
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import { NetworkTypeEnum, NetworkType, WifiNetwork } from '@acx-ui/rc/utils'
import { TenantLink }                                from '@acx-ui/react-router-dom'
import { useTableQuery }                             from '@acx-ui/utils'

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<WifiNetwork>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      sorter: true,
      render: function (_, row) {
        return (
          <TenantLink
            to={`/networks/wireless/${row.id}/network-details/overview`}>{row.name}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'nwSubType',
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: ['venues', 'count'],
      sorter: true,
      render: function (_, { venues }) {
        return venues?.count
      }
    }
  ]

  return columns
}

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'nwSubType',
    'venues',
    'id',
    'venueApGroups'
  ],
  sortField: 'name',
  sortOrder: 'ASC'
}

export function NetworkTable (props: { networkIds?: string[] }) {
  const { $t } = useIntl()
  const { networkIds } = props

  useEffect(() => {
    const payload = {
      ...defaultPayload,
      filters: { id: networkIds && networkIds?.length > 0 ? networkIds : [''] }
    }
    networkTableQuery.setPayload(payload)
  }, [networkIds])

  const networkTableQuery = useTableQuery({
    useQuery: useWifiNetworkListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: { id: networkIds && networkIds?.length > 0 ? networkIds : [''] }
    }
  })

  return (
    <Loader states={[
      networkTableQuery,
      { isLoading: false }
    ]}>
      <Card title={$t({ defaultMessage: 'Instance ({size})' },
        { size: networkTableQuery.data?.totalCount })}>
        <div style={{ width: '100%' }}>
          <Table
            rowKey='id'
            columns={useColumns()}
            dataSource={networkTableQuery.data?.data}
            pagination={networkTableQuery.pagination}
            onChange={networkTableQuery.handleTableChange}
          />
        </div>
      </Card>
    </Loader>
  )
}
