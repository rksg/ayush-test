import { SortOrder } from 'antd/lib/table/interface'
import { useIntl }   from 'react-intl'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useInviteCustomerListQuery
} from '@acx-ui/rc/services'
import {
  VarCustomer,
  useTableQuery
} from '@acx-ui/rc/utils'

export function RecentLogin () {
  const { $t } = useIntl()

  const columnsRecentLogin: TableProps<VarCustomer>['columns'] = [
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'tenantName',
      key: 'ipaddress',
      defaultSortOrder: 'ascend' as SortOrder,
      render: function () {
        return (
          '192.168.52.93'
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Location' }),
      dataIndex: 'tenantEmail',
      key: 'location',
      render: function () {
        return (
          'Sunnyvale, CA, United States'
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Date' }),
      dataIndex: 'acceptInvite',
      key: 'date',
      render: function () {
        return (
          '5/16/2022 06:55'
        )
      }
    }
  ]

  const invitationPayload = {
    searchString: '',
    fields: ['tenantName', 'tenantEmail'],
    filters: {
      status: ['DELEGATION_STATUS_INVITED'],
      delegationType: ['DELEGATION_TYPE_VAR'],
      isValid: [true]
    }
  }

  const PendingInvitaion = () => {
    const tableQuery = useTableQuery({
      useQuery: useInviteCustomerListQuery,
      defaultPayload: invitationPayload
    })

    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={columnsRecentLogin}
          dataSource={tableQuery.data?.data}
          style={{ width: '600px' }}
          rowKey='id'
          type={'form'}
        />
      </Loader>
    )
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <PendingInvitaion />
    </div>

  )
}