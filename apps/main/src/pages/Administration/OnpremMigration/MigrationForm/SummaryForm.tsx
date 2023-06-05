import { useEffect, useState } from 'react'

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
  useLazyGetMigrationResultQuery
} from '@acx-ui/rc/services'
import {
  MigrationResultType
} from '@acx-ui/rc/utils'

type SummaryFormProps = {
  taskId?: string
}

const SummaryForm = (props: SummaryFormProps) => {
  const { $t } = useIntl()
  const { taskId } = props
  const params = useParams()

  // eslint-disable-next-line max-len
  const [ validateZdApsResult, setValidateZdApsResult ] = useState<MigrationResultType[]>([])
  // eslint-disable-next-line max-len
  const [ getMigrationResult, { data: migrateResult }] = useLazyGetMigrationResultQuery()

  useEffect(() => {
    const interval = setInterval(() => {
      getMigrationResult({ params: { ...params, id: taskId } })
      // console.log('This will run every second!')
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(()=>{
    if (migrateResult) {
      setValidateZdApsResult(migrateResult?.apImportResults)
    }
  },[migrateResult])

  const callbackfn = (item: MigrationResultType) => {
    return item.state === 'Completed'
  }

  const columns: TableProps<MigrationResultType>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      key: 'apName',
      dataIndex: 'apName',
      render: (_, row) => {
        return row.apName ?? '--'
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
      key: 'validationErrors',
      dataIndex: 'validationErrors',
      render: (_, row) => {
        // eslint-disable-next-line max-len
        return row.validationErrors && row.validationErrors.length > 0 ? row.validationErrors.join(',') : '--'
      }
    }
  ]

  return (
    <Loader states={[
      { isLoading: false,
        isFetching: !migrateResult?.state
      }
    ]}>
      <Row>
        <Col span={12}>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Summary State' })}: {migrateResult?.state ?? '--'}
          </Subtitle>
        </Col>
      </Row>
      <Row>
        <Col span={3}>
          <Subtitle level={5}>
            {$t({ defaultMessage: 'Total' })}: {migrateResult?.apImportResults?.length ?? '--'}
          </Subtitle>
        </Col>
        <Col span={3}>
          <Subtitle level={5}>
            {$t({ defaultMessage: 'Completed' })}: {
              migrateResult?.apImportResults?.filter(callbackfn).length ?? '--'}
          </Subtitle>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={validateZdApsResult}
        rowKey='serial'
        locale={{
          // eslint-disable-next-line max-len
          emptyText: <Empty description={$t({ defaultMessage: 'No migration data' })} />
        }}
      />
    </Loader>
  )
}

export default SummaryForm
