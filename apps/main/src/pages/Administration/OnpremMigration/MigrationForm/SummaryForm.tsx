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
  Loader,
  cssStr,
  StackedBarChart
} from '@acx-ui/components'
import {
  SpaceWrapper
} from '@acx-ui/rc/components'
import {
  useLazyGetZdConfigurationQuery
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
  const [ getZdConfiguration, { data: migrateResult }] = useLazyGetZdConfigurationQuery()

  let usedBarColors = [
    cssStr('--acx-accents-blue-50'),
    cssStr('--acx-neutrals-30')
  ]

  let defaultSeries = [
    { name: 'used',
      value: 0 },
    { name: 'available',
      value: 100 }
  ]

  const [ series, setSeries ] = useState(defaultSeries)
  const [ progress, setProgress ] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      getZdConfiguration({ params: { ...params, id: taskId } })
      // console.log('This will run every second!')
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(()=>{
    // eslint-disable-next-line max-len
    if (migrateResult && migrateResult.data && migrateResult.data.length > 0 && migrateResult.data[0].migrationTaskList && migrateResult.data[0].migrationTaskList.length > 0) {
      // eslint-disable-next-line max-len
      setValidateZdApsResult(migrateResult.data[0].migrationTaskList[0].apImportResultList ? migrateResult.data[0].migrationTaskList[0].apImportResultList : [])
      const total = migrateResult.data[0].migrationTaskList[0].apImportResultList?.length
      // eslint-disable-next-line max-len
      const used = migrateResult.data[0].migrationTaskList[0].apImportResultList?.filter(apCompleted).length
      let series = [
        { name: 'used',
          value: (used / total)*100 },
        { name: 'available',
          value: ((total-used) / total)*100 }
      ]
      setSeries(series)
      setProgress(Math.floor((used/total) * 100))
    }
  },[migrateResult])

  const apCompleted = (item: MigrationResultType) => {
    return item.state === 'Completed' || item.state === 'Invalid'
  }

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
        return row.validationErrors ? row.validationErrors.split(';').join(' ') : '--'
      }
    }
  ]

  return (
    <Loader states={[
      { isLoading: false,
        // eslint-disable-next-line max-len
        isFetching: !(migrateResult?.data && migrateResult.data.length > 0 && migrateResult.data[0].migrationTaskList && migrateResult.data[0].migrationTaskList.length > 0 && migrateResult.data[0].migrationTaskList[0].state)
      }
    ]}>
      <Row>
        <Col span={12}>
          <Subtitle level={4}>
            {// eslint-disable-next-line max-len
              $t({ defaultMessage: 'Summary State' })}: {(migrateResult?.data && migrateResult.data.length > 0 && migrateResult.data[0].migrationTaskList && migrateResult.data[0].migrationTaskList.length > 0 && migrateResult.data[0].migrationTaskList[0].state) ?? '--'}
          </Subtitle>
        </Col>
      </Row>
      <Row>
        <Col span={3}>
          <Subtitle level={5}>
            {// eslint-disable-next-line max-len
              $t({ defaultMessage: 'Total' })}: {(migrateResult?.data && migrateResult.data.length > 0 && migrateResult.data[0].migrationTaskList && migrateResult.data[0].migrationTaskList.length > 0 && migrateResult.data[0].migrationTaskList[0].apImportResultList?.length) ?? '--'}
          </Subtitle>
        </Col>
        <Col span={3}>
          <Subtitle level={5}>
            {// eslint-disable-next-line max-len
              $t({ defaultMessage: 'Completed' })}: {(migrateResult?.data && migrateResult.data.length > 0 && migrateResult.data[0].migrationTaskList && migrateResult.data[0].migrationTaskList.length > 0 && migrateResult.data[0].migrationTaskList[0].apImportResultList?.filter(callbackfn).length) ?? '--'}
          </Subtitle>
        </Col>
        <Col span={7}>
          <SpaceWrapper full size='small' justifycontent='flex-start'>
            <Subtitle level={5}>{$t({ defaultMessage: 'Progress' })}:</Subtitle>
            <StackedBarChart
              style={{ height: 16, width: 135 }}
              showLabels={false}
              showTotal={false}
              showTooltip={false}
              barWidth={12}
              data={[{
                category: 'AP Migrations ',
                series
              }]}
              barColors={usedBarColors}
            />
            <Subtitle level={5}>{progress}%</Subtitle>
          </SpaceWrapper>
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
