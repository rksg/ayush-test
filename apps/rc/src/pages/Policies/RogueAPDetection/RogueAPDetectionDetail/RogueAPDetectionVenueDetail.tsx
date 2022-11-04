import React, { useContext } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Card, Table, TableProps }             from '@acx-ui/components'
import { useVenueRoguePolicyQuery }            from '@acx-ui/rc/services'
import { useTableQuery, VenueRoguePolicyType } from '@acx-ui/rc/utils'

import { RogueAPDetailContext } from './RogueAPDetectionDetailView'

const defaultPayload = {
  url: '/api/viewmodel/tenant/{tenantId}/venue',
  fields: [
    'id',
    'name',
    'city',
    'country',
    'switches',
    'rogueAps',
    'aggregatedApStatus',
    'rogueDetection',
    'status'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25,
  filters: {
    id: [] as string[]
  }
}

const RogueAPDetectionVenueDetail = () => {
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
      dataIndex: 'rogueAps',
      key: 'rogueAps',
      render: (row) => row ? row : 0
    }
  ]

  const { filtersId } = useContext(RogueAPDetailContext)

  const tableQuery = useTableQuery({
    useQuery: useVenueRoguePolicyQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        id: filtersId
      }
    }
  })

  const basicData = tableQuery.data?.data

  return (
    <Card title={`${$t({ defaultMessage: 'Instance' })}(${basicData?.length ?? 0})`}>
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
