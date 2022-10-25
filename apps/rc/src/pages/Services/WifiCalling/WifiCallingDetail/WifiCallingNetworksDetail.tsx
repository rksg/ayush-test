import React from 'react'

import { Col, Row }  from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Card, Table, TableProps }                            from '@acx-ui/components'
import { useGetWifiCallingServiceQuery, useNetworkListQuery } from '@acx-ui/rc/services'
import { useTableQuery, WifiCallingScope }                    from '@acx-ui/rc/utils'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'nwSubType',
    'venues',
    'id'
  ]
}

const WifiCallingNetworksDetail = (props: { tenantId: string }) => {
  const params = useParams()
  const { $t } = useIntl()
  const basicColumns: TableProps<WifiCallingScope>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'networkName',
      key: 'networkName'
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      key: 'venues'
    }
    // TODO: Temporarily hidden this block until Health api is ready
    // {
    //   title: $t({ defaultMessage: 'Service Health' }),
    //   dataIndex: 'serviceHealth',
    //   key: 'serviceHealth'
    // },
    // {
    //   title: $t({ defaultMessage: 'Voice quality/MoS score' }),
    //   dataIndex: 'voiceQualityScore',
    //   key: 'voiceQualityScore'
    // }
  ]

  const { data } = useGetWifiCallingServiceQuery({
    params: { ...params, tenantId: props.tenantId }
  })

  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload
  })

  const basicData = tableQuery.data?.data
    .filter((network) => {
      return data?.networkIds.includes(network.id)
    })
    .map((network) => {
      return {
        id: network.id,
        networkName: network.name,
        type: network.nwSubType,
        venues: network.venues.count
      }
    })

  return (
    <Card title={`${$t({ defaultMessage: 'Instance' })}(${basicData?.length})`}>
      <Row gutter={24} style={{ width: '100%' }}>
        <Col span={24}>
          <Table
            columns={basicColumns}
            dataSource={basicData}
            pagination={tableQuery.pagination}
            rowKey='id'
          />
        </Col>
      </Row>
    </Card>
  )
}

export default WifiCallingNetworksDetail
