
import { Col, Form, Row, Switch } from 'antd'
import { useIntl }                from 'react-intl'

import { StepsForm, Table, TableProps, useStepFormContext }                         from '@acx-ui/components'
import { useGetEdgeClusterListQuery }                                               from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeQosViewData, defaultSort, sortProp, useTableQuery } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

export const ScopeForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeQosViewData>()

  const tableQuery = useTableQuery({
    useQuery: useGetEdgeClusterListQuery,
    defaultPayload: {
      fields: [
        'name',
        'clusterId',
        'venueId',
        'venueName'
      ]
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const columns: TableProps<EdgeClusterStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'Cluster' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venueName',
      dataIndex: 'venueName',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      key: 'activeAp',
      dataIndex: 'activeAp',
      fixed: 'left',
      width: 50
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      dataIndex: 'activate',
      key: 'activate',
      align: 'center',
      render: (_, row) => {
        return <Form.Item
          name={['activateChangedClusters', row.clusterId??'']}
          valuePropName='checked'
          noStyle
          children={<Switch onChange={() =>
            setActivateChangedClustersInfo(row.clusterId??'', row.name??'', row.venueId??'')}/>}
        />
      }
    }
  ]

  const setActivateChangedClustersInfo = (clusterId:string, clusterName:string, venueId:string) => {
    form.setFieldValue('activateChangedClustersInfo', {
      ...form.getFieldValue('activateChangedClustersInfo'),
      [clusterId]: { venueId: venueId, clusterName: clusterName }
    })

  }

  return (
    <Row>
      <Col span={13}>
        <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>
      </Col>
      <Col span={15}>
        <UI.FieldText>
          {
            $t({
              // eslint-disable-next-line max-len
              defaultMessage: 'Activate clusters that the QoS bandwidth profile will be applied:'
            })
          }
        </UI.FieldText>
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          rowKey='clusterId'
        />
      </Col>
    </Row>


  )
}
