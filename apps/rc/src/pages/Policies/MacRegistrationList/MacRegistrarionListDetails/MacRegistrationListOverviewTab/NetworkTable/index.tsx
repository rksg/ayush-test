import React from 'react'

import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  Card
} from '@acx-ui/components'
import {
  useNetworkListQuery
} from '@acx-ui/rc/services'
import { useTableQuery, Network, NetworkTypeEnum, NetworkType } from '@acx-ui/rc/utils'
import { TenantLink }                                           from '@acx-ui/react-router-dom'


const disabledType = [NetworkTypeEnum.DPSK, NetworkTypeEnum.CAPTIVEPORTAL]

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        if (disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1) {
          return data
        } else {
          return (
            <TenantLink
              to={`/networks/wireless/${row.id}/network-details/overview`}>{data}</TenantLink>
          )
        }
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'nwSubType',
      dataIndex: 'nwSubType',
      render: (data: unknown, row) => <NetworkType
        networkType={data as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: ['venues', 'count'],
      align: 'left',
      render: function (count) {
        return count
      }
    }
  ]

  return columns
}

const defaultPayload = {
  fields: [],
  filters: {},
  sortField: 'name',
  sortOrder: 'ASC'
}

export function NetworkTable () {
  const { $t } = useIntl()
  const networkTableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload
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
          />
        </div>
      </Card>
    </Loader>
  )
}
