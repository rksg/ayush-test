import React, { useContext, useEffect } from 'react'

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
  MigrationActionTypes,
  MigrationResultType
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

  // eslint-disable-next-line max-len
  const { data: validateResult } = useGetMigrationResultQuery({ params: { ...params, id: taskId } })

  useEffect(()=>{
    if (validateResult?.state && validateResult?.state === 'Qualified') {
      dispatch({
        type: MigrationActionTypes.ERRORMSG,
        payload: {
          errorMsg: ''
        }
      })
    }
  },[validateResult])

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
        // eslint-disable-next-line max-len
        return row.validationErrors && row.validationErrors.length > 0 ? row.validationErrors.join(',') : '--'
      }
    }
  ]

  return (
    <Loader states={[
      { isLoading: false,
        isFetching: !validateResult?.state
      }
    ]}>
      <Row>
        <Col span={12}>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Validation State' })}: {validateResult?.state ?? '--'}
          </Subtitle>
        </Col>
      </Row>
      <Row>
        <Col span={3}>
          <Subtitle level={5}>
            {$t({ defaultMessage: 'Total' })}: {validateResult?.apImportResults?.length ?? '--'}
          </Subtitle>
        </Col>
        <Col span={3}>
          <Subtitle level={5}>
            {$t({ defaultMessage: 'Valid' })}: {
              validateResult?.apImportResults?.filter(callbackfn).length ?? '--'}
          </Subtitle>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={validateResult?.apImportResults}
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
