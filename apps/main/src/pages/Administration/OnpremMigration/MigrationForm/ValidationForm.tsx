import React, { useContext, useEffect, useState } from 'react'

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
  useLazyGetZdConfigurationQuery
} from '@acx-ui/rc/services'
import {
  MigrationActionTypes,
  MigrationResultType,
  ZdConfigurationType
} from '@acx-ui/rc/utils'

import MigrationContext from '../MigrationContext'

type ValidationFormProps = {
  taskId?: string
}

const ValidationForm = (props: ValidationFormProps) => {
  const { $t } = useIntl()
  const { taskId } = props
  const params = useParams()

  const {
    dispatch
  } = useContext(MigrationContext)

  const [getZdConfiguration] = useLazyGetZdConfigurationQuery()
  const [validateResult, setValidateResult] = useState<ZdConfigurationType>()
  const getValidateResult = async () => {
    // eslint-disable-next-line max-len
    const validateResult = await (getZdConfiguration({ params: { ...params, id: taskId } }).unwrap())
    setValidateResult(validateResult)
    // eslint-disable-next-line max-len
    if (validateResult?.data && validateResult.data.length > 0 && validateResult.data[0].migrationTaskList && validateResult.data[0].migrationTaskList.length > 0 && validateResult.data[0].migrationTaskList[0].state === 'Qualified') {
      dispatch({
        type: MigrationActionTypes.ERRORMSG,
        payload: {
          errorMsg: ''
        }
      })
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      getValidateResult()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const callbackfn = (item: MigrationResultType) => {
    return item.state === 'Valid'
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
        isFetching: !(validateResult?.data && validateResult.data.length > 0 && validateResult.data[0].migrationTaskList && validateResult.data[0].migrationTaskList.length > 0 && validateResult.data[0].migrationTaskList[0].state)
      }
    ]}>
      <Row>
        <Col span={12}>
          <Subtitle level={4}>
            {// eslint-disable-next-line max-len
              $t({ defaultMessage: 'Validation State' })}: {(validateResult?.data && validateResult.data.length > 0 && validateResult.data[0].migrationTaskList && validateResult.data[0].migrationTaskList.length > 0 && validateResult.data[0].migrationTaskList[0].state) ?? '--'}
          </Subtitle>
        </Col>
      </Row>
      <Row>
        <Col span={3}>
          <Subtitle level={5}>
            {// eslint-disable-next-line max-len
              $t({ defaultMessage: 'Total' })}: {(validateResult?.data && validateResult.data.length > 0 && validateResult.data[0].migrationTaskList && validateResult.data[0].migrationTaskList.length > 0 && validateResult.data[0].migrationTaskList[0].apImportResultList?.length) ?? '--'}
          </Subtitle>
        </Col>
        <Col span={3}>
          <Subtitle level={5}>
            {// eslint-disable-next-line max-len
              $t({ defaultMessage: 'Valid' })}: {(validateResult?.data && validateResult.data.length > 0 && validateResult.data[0].migrationTaskList && validateResult.data[0].migrationTaskList.length > 0 && validateResult.data[0].migrationTaskList[0].apImportResultList?.filter(callbackfn).length) ?? '--'}
          </Subtitle>
        </Col>
      </Row>
      <Table
        columns={columns}
        // eslint-disable-next-line max-len
        dataSource={(validateResult?.data && validateResult.data.length > 0 && validateResult.data[0].migrationTaskList && validateResult.data[0].migrationTaskList.length > 0 && validateResult.data[0].migrationTaskList[0].apImportResultList) as MigrationResultType[]}
        rowKey='serial'
        locale={{
          // eslint-disable-next-line max-len
          emptyText: <Empty description={$t({ defaultMessage: 'No migration data' })} />
        }}
      />
    </Loader>
  )
}

export default ValidationForm
