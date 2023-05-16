import { useState } from 'react'

import {
  Col,
  Row,
  Drawer,
  Empty
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Button,
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
  useGetZdMigrationListQuery
} from '@acx-ui/rc/services'
import {
  TaskContextType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import {
  GuestsDetail
} from '../MigrationDetail'


const MigrationTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [visible, setVisible] = useState(false)
  const [currentTask, setCurrentTask] = useState({} as TaskContextType)
  // const dataMock = [{
  //   name: 'migration-001.bak',
  //   state: 'success',
  //   startTime: '2023-03-02 02:00:10 UTC',
  //   endTime: '2023-03-02 03:33:13 UTC',
  //   summary: 'All 4 APs were migrated to venue migration-P0d5E3J3'
  // },{
  //   name: 'migration-002.bak',
  //   state: 'success',
  //   startTime: '2023-03-02 02:00:10 UTC',
  //   endTime: '2023-03-02 03:33:13 UTC',
  //   summary: 'All 44 APs were migrated to venue migration-ABCDEFG'
  // }]

  const { data: migrationList, isLoading, isFetching }= useGetZdMigrationListQuery({ params })

  const onClose = () => {
    setVisible(false)
  }

  const columns: TableProps<TaskContextType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Backup File' }),
      key: 'fileName',
      dataIndex: 'fileName',
      searchable: true,
      render: (_, row) => {
        return row.fileName ?? '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Created Venue' }),
      key: 'venue',
      dataIndex: 'venue',
      searchable: true,
      render: () => {
        return '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'state',
      dataIndex: 'state',
      searchable: true,
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
      key: 'summary',
      dataIndex: 'summary',
      searchable: true,
      render: () => {
        return '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Start Date' }),
      key: 'startTime',
      dataIndex: 'startTime',
      render: (_, row) => {
        return row.createTime ? formatter(DateFormatEnum.DateTimeFormat)(row.createTime) : '--'
      }
    },
    {
      title: $t({ defaultMessage: 'End Date' }),
      key: 'endTime',
      dataIndex: 'endTime',
      render: () => {
        return '--'
      }
    }
  ]

  const rowActions: TableProps<TaskContextType>['rowActions'] = [{
    label: $t({ defaultMessage: 'Delete' }),
    // onClick: (rows, clearSelection) => {
    onClick: (rows) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Migrations' }),
          entityValue: rows.length === 1 ? rows[0].fileName : undefined,
          numOfEntities: rows.length,
          confirmationText: 'Delete'
        },
        onOk: () => {
          // rows.length === 1 ?
          // deleteVenue({ params: { tenantId, venueId: rows[0].id } })
          //   .then(clearSelection) :
          // deleteVenue({ params: { tenantId }, payload: rows.map(item => item.id) })
          //   .then(clearSelection)
        }
      })
    }
  }]


  return (
    <Loader states={[
      { isLoading: isLoading,
        isFetching: isFetching
      }
    ]}>
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
        dataSource={migrationList}
        rowKey='taskId'
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
        locale={{
          // eslint-disable-next-line max-len
          emptyText: <Empty description={$t({ defaultMessage: 'No migration data' })} />
        }}
      />

      <Drawer
        title={$t({ defaultMessage: 'Migration Details' })}
        visible={visible}
        onClose={onClose}
        mask={false}
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
