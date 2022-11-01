import React from 'react'

import { Col, Row }  from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Card, Table, TableProps }       from '@acx-ui/components'
import { useVenueRoguePolicyQuery } from '@acx-ui/rc/services'
import { RogueVenueData, useTableQuery, VenueRoguePolicyType } from '@acx-ui/rc/utils';

const defaultPayload = {
  url: '/api/viewmodel/tenant/{tenantId}/venue',
  fields: [
    'id',
    'name',
    'city',
    'country',
    'switches',
    'aggregatedApStatus',
    'rogueDetection',
    'status'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25
}

const RogueAPDetectionVenueDetail = () => {
  const params = useParams()
  const { $t } = useIntl()
  const basicColumns: TableProps<VenueRoguePolicyType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'city',
      key: 'city'
    },
    {
      title: $t({ defaultMessage: 'Rogue APs' }),
      dataIndex: 'aggregatedApStatus',
      key: 'aggregatedApStatus',
      render: (data, row) => {
        if (row.aggregatedApStatus?.hasOwnProperty('2_00_Operational')) {
          return row.aggregatedApStatus['2_00_Operational']
        }
        return 0
      }
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: useVenueRoguePolicyQuery,
    defaultPayload
  })

  const basicData = tableQuery.data?.data

  return (
    <Card title={`${$t({ defaultMessage: 'Instance' })}(${basicData?.length})`}>
      <Row gutter={24} style={{ width: '100%' }}>
        <Col span={24}>
          <Table
            columns={basicColumns}
            dataSource={basicData}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
            rowKey='id'
          />
        </Col>
      </Row>
    </Card>
  )
}

export default RogueAPDetectionVenueDetail
