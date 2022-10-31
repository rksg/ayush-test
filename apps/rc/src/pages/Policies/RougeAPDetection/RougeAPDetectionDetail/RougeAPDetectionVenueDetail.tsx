import React from 'react'

import { Col, Row }  from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Card, Table, TableProps }       from '@acx-ui/components'
import { useVenuesListQuery }            from '@acx-ui/rc/services'
import { RougeVenueData, useTableQuery } from '@acx-ui/rc/utils'

const defaultPayload = {
  searchString: '',
  fields: [
    'aggregatedApStatus',
    'switches',
    'name',
    'venue',
    'id'
  ]
}

const RougeAPDetectionVenueDetail = () => {
  const params = useParams()
  const { $t } = useIntl()
  const basicColumns: TableProps<RougeVenueData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'venue',
      key: 'venue',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Rouge APs' }),
      dataIndex: 'aps',
      key: 'aps'
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload
  })

  const basicData = tableQuery.data?.data
    .map((venue) => {
      return {
        venue: venue.name,
        aps: 1
      } as RougeVenueData
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

export default RougeAPDetectionVenueDetail
