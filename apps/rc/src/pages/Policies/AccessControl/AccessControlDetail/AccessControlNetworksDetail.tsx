import React, { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Card, Table, TableProps }                                                      from '@acx-ui/components'
import { useNetworkListQuery }                                                          from '@acx-ui/rc/services'
import { AccessControlInfoType, Network, NetworkTypeEnum, networkTypes, useTableQuery } from '@acx-ui/rc/utils'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'nwSubType',
    'venues',
    'id'
  ]
}

const AccessControlNetworksDetail = (props: { data: AccessControlInfoType | undefined }) => {
  const { $t } = useIntl()
  const { data } = props
  const basicColumns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      key: 'nwSubType',
      render: (data, row) => {
        return $t(networkTypes[row.nwSubType as NetworkTypeEnum])
      }
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      key: 'venues',
      renderText: (row) => row.count
    }
  ]

  useEffect(() => {
    if (data?.networkIds?.length) {
      tableQuery.setPayload({
        ...defaultPayload,
        filters: {
          id: data.networkIds
        }
      })
    }
  }, [data])

  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        id: data?.networkIds?.length ? data?.networkIds : ['none']
      }
    }
  })

  return (
    <Card title={$t({ defaultMessage: 'Instance ({count})' }, {
      count: tableQuery.data?.totalCount
    })}>
      <Table
        columns={basicColumns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Card>
  )
}

export default AccessControlNetworksDetail
