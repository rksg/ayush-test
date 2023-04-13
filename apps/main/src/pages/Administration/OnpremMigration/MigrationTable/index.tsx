import { useState } from 'react'

import {
  Drawer,
  Empty,
  Badge
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Button,
  Table,
  TableProps,
  Subtitle,
  Loader
} from '@acx-ui/components'
import {
  useGetDelegationsQuery
} from '@acx-ui/rc/services'
import {
  MigrateState
} from '@acx-ui/rc/utils'

import {
  GuestsDetail
} from '../MigrationDetail'
import * as UI from '../styledComponents'


const FunctionEnabledStatusLightConfig = {
  active: {
    color: 'var(--acx-semantics-green-50)'
  },
  inActive: {
    color: 'var(--acx-neutrals-50)'
  }
}


const MigrationTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  // const [revokeInvitation] = useRevokeInvitationMutation()
  const [visible, setVisible] = useState(false)
  const [currentGuest, setCurrentGuest] = useState({} as MigrateState)
  const dataMock = [{
    name: 'migration-001.bak',
    state: 'success',
    startTime: '2023-03-02 02:00:10 UTC',
    endTime: '2023-03-02 03:33:13 UTC',
    summary: 'All 4 APs were migrated to venue migration-P0d5E3J3'
  }]

  const { isLoading, isFetching }= useGetDelegationsQuery({ params })

  const onClose = () => {
    setVisible(false)
  }

  const renderDataWithStatus = (data: string, enabled: string) => {
    return data ? <Badge
      color={FunctionEnabledStatusLightConfig[enabled==='success' ? 'active' : 'inActive'].color}
      text={data}
    /> : data
  }

  const columns: TableProps<MigrateState>['columns'] = [
    {
      title: $t({ defaultMessage: 'Bak Filename' }),
      key: 'bakName',
      dataIndex: 'bakName',
      render: (data, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            setCurrentGuest(row)
            setVisible(true)
          }}
        >
          {row.name as string}
        </Button>
    },
    {
      title: $t({ defaultMessage: 'State' }),
      key: 'state',
      dataIndex: 'state',
      render: (_, row) => {
        return renderDataWithStatus(row.state as string, row.state as string)
        // return row.state
      }
    },
    {
      title: $t({ defaultMessage: 'Start Time' }),
      key: 'startTime',
      dataIndex: 'startTime',
      render: (_, row) => {
        return row.startTime
      }
    },
    {
      title: $t({ defaultMessage: 'End Time' }),
      key: 'endTime',
      dataIndex: 'endTime',
      render: (_, row) => {
        return row.endTime
      }
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      key: 'summary',
      dataIndex: 'summary',
      render: (_, row) => {
        return row.summary
      }
    }
  ]


  return (
    <Loader states={[
      { isLoading: isLoading,
        isFetching: isFetching
      }
    ]}>
      <UI.TableTitleWrapper direction='vertical'>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Migration State' })}
        </Subtitle>
      </UI.TableTitleWrapper>

      <Table
        columns={columns}
        dataSource={dataMock}
        rowKey='id'
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
            currentGuest={currentGuest}
          />
        }
        width={'550px'}
      />

    </Loader>
  )
}

export default MigrationTable
