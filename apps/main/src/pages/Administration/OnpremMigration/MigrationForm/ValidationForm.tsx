import {
  Col,
  Row,
  Empty
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Table,
  TableProps,
  Subtitle,
  Loader
} from '@acx-ui/components'
import {
  useGetMigrationResultQuery
} from '@acx-ui/rc/services'
import {
  MigrationResultType
} from '@acx-ui/rc/utils'

type ValidationFormProps = {
  taskId?: string
}

const ValidationForm = (props: ValidationFormProps) => {
  const { $t } = useIntl()
  const { taskId } = props
  const params = useParams()
  // const dataMock = [{
  //   name: 'AP-1',
  //   description: 'zd ap',
  //   serialNumber: '123456789021',
  //   status: 'Failed',
  //   failure: 'Not support model'
  // },{
  //   name: 'AP-2',
  //   description: 'zd ap2',
  //   serialNumber: '234789879791',
  //   status: 'Success',
  //   failure: 'Not found ap serial number'
  // }]
  // eslint-disable-next-line max-len
  const { data: validateResult, isLoading, isFetching } = useGetMigrationResultQuery({ params: { ...params, id: taskId } })

  const columns: TableProps<MigrationResultType>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      key: 'name',
      dataIndex: 'name',
      render: (_, row) => {
        return row.name ?? '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description',
      render: (_, row) => {
        return row.description ?? '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      key: 'serial',
      dataIndex: 'serial',
      render: (_, row) => {
        return row.serial ?? '--'
      }

    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'state',
      dataIndex: 'state',
      render: (data, row) => {
        return row.state ?? '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Failure Reason' }),
      key: 'failure',
      dataIndex: 'failure',
      render: (_, row) => {
        return row.failure ?? '--'
      }
    }
  ]

  return (
    <Loader states={[
      { isLoading: isLoading,
        isFetching: isFetching
      }
    ]}>
      <Row>
        <Col span={12}>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Validation Table' })}
          </Subtitle>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={validateResult?.apImportResults}
        rowKey='id'
        locale={{
          // eslint-disable-next-line max-len
          emptyText: <Empty description={$t({ defaultMessage: 'No migration data' })} />
        }}
      />
    </Loader>
  )
}

export default ValidationForm
