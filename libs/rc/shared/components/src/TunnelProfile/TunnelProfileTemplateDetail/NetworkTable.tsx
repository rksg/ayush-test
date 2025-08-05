import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                 from '@acx-ui/components'
import { useGetNetworkTemplateListQuery }                            from '@acx-ui/rc/services'
import { ConfigTemplateType, Network, NetworkType, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { useTableQuery }                                             from '@acx-ui/utils'

import { renderConfigTemplateDetailsComponent } from '../../configTemplates'

interface NetworkTableProps {
  networkIds: string[]
}

export const NetworkTable = (props: NetworkTableProps) => {
  const { networkIds } = props
  const { $t } = useIntl()
  const [isPayloadReady,setIsPayloadReady] = useState(false)
  const defaultNetworkPayload = {
    fields: [
      'id',
      'name',
      'nwSubType',
      'venues'
    ],
    filters: { id: networkIds }
  }
  const tableQuery = useTableQuery({
    useQuery: useGetNetworkTemplateListQuery,
    defaultPayload: defaultNetworkPayload,
    option: {
      skip: !isPayloadReady || networkIds.length === 0
    },
    enableRbac: true
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { id: networkIds }
    })
  }, [networkIds])

  useEffect(() => {
    if(tableQuery?.payload?.filters?.id.length > 0) {
      setIsPayloadReady(true)
    }
  }, [tableQuery.payload.filters])

  const columns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Template' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        return renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, row.id, row.name)
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'nwSubType',
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => (
        <NetworkType
          networkType={row.nwSubType as NetworkTypeEnum}
          row={row}
        />
      )
    },
    {
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural> Template' }),
      key: 'venues',
      dataIndex: 'venues',
      sorter: true,
      render: (_, row) => row.venues.count
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={tableQuery.data?.data}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}