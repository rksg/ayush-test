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
  SpaceWrapper
} from '@acx-ui/rc/components'
import {
  useGetDelegationsQuery
} from '@acx-ui/rc/services'
import {
  MigrateState
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import {
  GuestsDetail
} from '../MigrationDetail'


const MigrationTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [visible, setVisible] = useState(false)
  const [currentGuest, setCurrentGuest] = useState({} as MigrateState)
  const dataMock = [{
    name: 'migration-001.bak',
    state: 'success',
    startTime: '2023-03-02 02:00:10 UTC',
    endTime: '2023-03-02 03:33:13 UTC',
    summary: 'All 4 APs were migrated to venue migration-P0d5E3J3'
  },{
    name: 'migration-002.bak',
    state: 'success',
    startTime: '2023-03-02 02:00:10 UTC',
    endTime: '2023-03-02 03:33:13 UTC',
    summary: 'All 44 APs were migrated to venue migration-ABCDEFG'
  }]

  const { isLoading, isFetching }= useGetDelegationsQuery({ params })

  const onClose = () => {
    setVisible(false)
  }

  const columns: TableProps<MigrateState>['columns'] = [
    {
      title: $t({ defaultMessage: 'Backup File' }),
      key: 'bakName',
      dataIndex: 'bakName',
      searchable: true,
      render: (_, row) => {
        return row.name
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
            setCurrentGuest(row)
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
      render: (_, row) => {
        return row.summary
      }
    },
    {
      title: $t({ defaultMessage: 'Start Date' }),
      key: 'startTime',
      dataIndex: 'startTime',
      render: (_, row) => {
        return row.startTime
      }
    },
    {
      title: $t({ defaultMessage: 'End Date' }),
      key: 'endTime',
      dataIndex: 'endTime',
      render: (_, row) => {
        return row.endTime
      }
    }
  ]

  const rowActions: TableProps<MigrateState>['rowActions'] = [{
    label: $t({ defaultMessage: 'Delete' }),
    // onClick: (rows, clearSelection) => {
    onClick: (rows) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Migrations' }),
          entityValue: rows.length === 1 ? rows[0].name : undefined,
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
        dataSource={dataMock}
        rowKey='id'
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
        children={
          <GuestsDetail
            triggerClose={onClose}
            currentGuest={currentGuest}
          />
        }
        width={'550px'}
      />

    </Loader>
  )
}

export default MigrationTable
