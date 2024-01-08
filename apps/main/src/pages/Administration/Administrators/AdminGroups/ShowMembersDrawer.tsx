import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableProps } from '@acx-ui/components'
import { DateFormatEnum, formatter }                 from '@acx-ui/formatter'
import {
  useAdminLogsQuery
} from '@acx-ui/rc/services'
import { AdminLog, CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { noDataDisplay }                           from '@acx-ui/utils'

interface ShowMembersDrawerProps {
  visible: boolean
  membersGroupId: string
  setVisible: (visible: boolean) => void
}

export const ShowMembersDrawer = (props: ShowMembersDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, membersGroupId } = props
  const [form] = Form.useForm()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const tableQuery = useTableQuery({
    useQuery: useAdminLogsQuery,
    pagination: {
      pageSize: 10000
    },
    defaultPayload: {
      url: CommonUrlsInfo.getEventList.url,
      fields: [
        'event_datetime',
        'severity',
        'entity_type',
        'entity_id',
        'message',
        'adminName',
        'id',
        'ipAddress'
      ],
      searchString: 'logged',
      filters: {
        entity_type: ['ADMIN', 'NOTIFICATION']
      }
    },
    sorter: {
      sortField: 'event_datetime',
      sortOrder: 'DESC'
    }
  })

  const tableData = getProfilesByType(tableQuery.data?.data as AdminLog[])

  function getProfilesByType (queryData: AdminLog[]) {
    // return queryData
    return queryData?.filter(p =>
      p.message.includes('logged into') && p.message.includes(membersGroupId)).slice(0, 5)
  }

  const columnsRecentLogin: TableProps<AdminLog>['columns'] = [
    {
      title: $t({ defaultMessage: 'Email' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      searchable: true,
      render: function (_, row) {
        return (row.ipAddress?? noDataDisplay)
      }
    },
    {
      title: $t({ defaultMessage: 'Last Log-In' }),
      dataIndex: 'event_datetime',
      key: 'date',
      render: function (_, row) {
        return formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.event_datetime)
      }
    }
  ]

  const EventListTable = () => {
    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={columnsRecentLogin}
          dataSource={tableData}
          style={{ width: '300px' }}
          rowKey='id'
          type={'form'}
        />
      </Loader>
    )
  }

  const formContent = <Form layout='vertical'form={form} >
    <h4 style={{ marginBottom: 20 }}>{$t({
      defaultMessage:
        'Only group members who have already logged in to RUCKUS One are listed here'
    })}</h4>
    <EventListTable />
  </Form>

  const footer =<div>
    <Button
      onClick={() => {setVisible(false)}}
      style={{ width: 120 }}
      type='primary'>
      {$t({ defaultMessage: 'Ok' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Logged Group Members' })}
      width={452}
      visible={visible}
      onClose={onClose}
      children={formContent}
      footer={footer}
    />
  )
}
