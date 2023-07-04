import { useState } from 'react'

import {
  Col,
  Row,
  Empty
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Button,
  Drawer,
  Table,
  TableProps,
  Subtitle,
  Loader,
  showActionModal
} from '@acx-ui/components'
import {
  formatter,
  DateFormatEnum
} from '@acx-ui/formatter'
import {
  SpaceWrapper
} from '@acx-ui/rc/components'
import {
  useGetZdConfigurationListQuery,
  useDeleteMigrationMutation
} from '@acx-ui/rc/services'
import {
  TaskContextType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import {
  GuestsDetail
} from '../MigrationDetail'

const defaultPayload = {
  fields: [
    'taskId',
    'createTime',
    'completedTime',
    'state',
    'lastStateUpdateTime',
    'errorMessage',
    'fileName',
    'venueName',
    'venueId',
    'address',
    'city',
    'country',
    'timezone',
    'description',
    'tenantId'
  ],
  searchString: '',
  filters: {
    // eslint-disable-next-line max-len
    state: ['SystemImporting', 'ApImporting', 'WaitingSystemImportRetry', 'Completed', 'WaitingApImportRetry', 'Failed']
  }
}

const sorter = {
  sortField: 'createTime',
  sortOrder: 'DESC'
}

const MigrationTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [visible, setVisible] = useState(false)
  const [currentTask, setCurrentTask] = useState({} as TaskContextType)

  const tableQuery = useTableQuery({
    useQuery: useGetZdConfigurationListQuery,
    defaultPayload,
    sorter
  })
  const [
    deleteMigration
  ] = useDeleteMigrationMutation()

  const onClose = () => {
    setVisible(false)
  }

  const columns: TableProps<TaskContextType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Backup File' }),
      key: 'fileName',
      dataIndex: 'fileName',
      searchable: true,
      sorter: true,
      render: (_, row) => {
        return row.fileName ?? '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Created Venue' }),
      key: 'venueName',
      dataIndex: 'venueName',
      searchable: true,
      sorter: true,
      render: (_, row) => {
        return row.venueName ?? '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'state',
      dataIndex: 'state',
      searchable: true,
      sorter: true,
      render: (data, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            setCurrentTask(row)
            setVisible(true)
          }}
        >
          {row.state as string}
        </Button>
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description',
      searchable: true,
      sorter: true,
      render: (_, row) => {
        return row.description ?? '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Start Time' }),
      key: 'createTime',
      dataIndex: 'createTime',
      sorter: true,
      // defaultSortOrder: 'descend',
      render: (_, row) => {
        return row.createTime ? formatter(DateFormatEnum.DateTimeFormat)(row.createTime) : '--'
      }
    },
    {
      title: $t({ defaultMessage: 'End Time' }),
      key: 'completedTime',
      dataIndex: 'completedTime',
      render: (_, row) => {
        // eslint-disable-next-line max-len
        return row.completedTime ? formatter(DateFormatEnum.DateTimeFormat)(row.completedTime) : '--'
      }
    }
  ]

  const rowActions: TableProps<TaskContextType>['rowActions'] = [{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (rows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Migrations' }),
          entityValue: rows.length === 1 ? rows[0].fileName : undefined,
          numOfEntities: rows.length,
          confirmationText: $t({ defaultMessage: 'Delete' })
        },
        onOk: () => {
          rows.forEach(function (item) {
            deleteMigration({ params: { ...params, id: item.taskId } })
              .then(clearSelection)
          })
        }
      })
    }
  }]


  return (
    <Loader states={[tableQuery]}>
      <Row>
        <Col span={12}>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Migrated ZD Configurations' })}
          </Subtitle>
        </Col>
        <Col span={12}>
          <SpaceWrapper full justifycontent='flex-end' size='large'>
            <TenantLink to='/administration/onpremMigration/add'>
              <Button type='primary'>{ $t({ defaultMessage: 'Migrate ZD Configuration' }) }</Button>
            </TenantLink>
          </SpaceWrapper>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        // dataSource={migrationList}
        rowKey='taskId'
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        searchableWidth={430}
        locale={{
          // eslint-disable-next-line max-len
          emptyText: <Empty description={$t({ defaultMessage: 'No migration data' })} />
        }}
      />

      <Drawer
        title={$t({ defaultMessage: 'Migration Details' })}
        visible={visible}
        onClose={onClose}
        children={
          <GuestsDetail
            triggerClose={onClose}
            currentTask={currentTask}
          />
        }
        width={'550px'}
      />

    </Loader>
  )
}

export default MigrationTable
