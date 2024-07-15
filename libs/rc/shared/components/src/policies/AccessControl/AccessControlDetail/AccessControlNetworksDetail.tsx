import React, { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Card, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import {
  useGetNetworkTemplateListQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  AccessControlInfoType,
  Network,
  NetworkTypeEnum,
  networkTypes,
  useConfigTemplate,
  useTableQuery
} from '@acx-ui/rc/utils'

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
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const { data } = props
  const basicColumns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      align: 'left',
      searchable: true,
      key: 'name',
      fixed: 'left',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      align: 'left',
      key: 'nwSubType',
      sorter: true,
      render: (_, row) => {
        return $t(networkTypes[row.nwSubType as NetworkTypeEnum])
      }
    },
    {
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venues',
      align: 'center',
      key: 'venues',
      sorter: true,
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
    useQuery: isTemplate ? useGetNetworkTemplateListQuery :
      isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery,
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
        enableApiFilter={true}
        dataSource={tableQuery.data?.data}
        onFilterChange={tableQuery.handleFilterChange}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Card>
  )
}

export default AccessControlNetworksDetail
