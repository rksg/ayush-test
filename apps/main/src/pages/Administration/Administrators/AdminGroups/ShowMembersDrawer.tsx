import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableProps } from '@acx-ui/components'
import { DateFormatEnum, formatter }                 from '@acx-ui/formatter'
import {
  useGetAdminGroupLastLoginsQuery
} from '@acx-ui/rc/services'
import { groupMembers } from '@acx-ui/rc/utils'

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

  const { data: adminLastLogins } =
    useGetAdminGroupLastLoginsQuery({ params: { adminGroupId: membersGroupId } })

  const memberCount = adminLastLogins?.count || 0

  const columnsRecentLogin: TableProps<groupMembers>['columns'] = [
    {
      title: $t({ defaultMessage: 'Email' }),
      dataIndex: 'email',
      key: 'email',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Last Log-In' }),
      dataIndex: 'lastLoginDate',
      key: 'lastLoginDate',
      render: function (_, row) {
        return formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.lastLoginDate)
      }
    }
  ]

  const GroupMembersTable = () => {
    return (
      <Loader >
        <Table
          columns={columnsRecentLogin}
          dataSource={adminLastLogins?.lastLoginList}
          rowKey='email'
          type={'form'}
        />
      </Loader>
    )
  }

  const formContent = <Form layout='vertical'form={form} >
    <div style={{ marginBottom: 20 }}>{$t({
      defaultMessage:
        'Only group members who have already logged in to RUCKUS One are listed here'
    })}</div>
    <GroupMembersTable />
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
      title={$t({ defaultMessage: 'Logged Group Members ({memberCount})' }, { memberCount })}
      width={452}
      visible={visible}
      onClose={onClose}
      children={formContent}
      footer={footer}
    />
  )
}
