import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { useVenuesListQuery }      from '@acx-ui/rc/services'
import { useTableQuery, Venue }    from '@acx-ui/rc/utils'
import { TenantLink, useNavigate } from '@acx-ui/react-router-dom'

import { AAAServerTypeEnum, AAA_Level_UI_Type, AAA_Purpose_UI_Type } from './contentsMap'

function useColumns (type: AAAServerTypeEnum) {
  const { $t } = useIntl()
  const radiusColumns: TableProps<any>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'Authentication Port' }),
      key: 'authPort',
      dataIndex: 'authPort'
    },
    {
      title: $t({ defaultMessage: 'Accounting Port' }),
      key: 'acctPort',
      dataIndex: 'acctPort'
    },
    {
      title: $t({ defaultMessage: 'Shared Secret' }),
      key: 'secret'
    }
  ]
  const tacacsColumns: TableProps<any>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'Authentication Port' }),
      key: 'authPort',
      dataIndex: 'authPort'
    },
    {
      title: $t({ defaultMessage: 'Accounting Port' }),
      key: 'acctPort',
      dataIndex: 'acctPort'
    },
    {
      title: $t({ defaultMessage: 'Shared Secret' }),
      key: 'secret'
    },
    {
      title: $t({ defaultMessage: 'Purpose' }),
      key: 'purpose',
      dataIndex: 'purpose',
      render: function (data, row) {
        return _.get(AAA_Purpose_UI_Type, row.purpose)
      }
    }
  ]
  const localUserColumns: TableProps<any>['columns'] = [
    {
      title: $t({ defaultMessage: 'Username' }),
      key: 'username',
      dataIndex: 'username'
    },
    {
      title: $t({ defaultMessage: 'Password' }),
      key: 'password',
      dataIndex: 'password'
    },
    {
      title: $t({ defaultMessage: 'Privilege' }),
      key: 'level',
      dataIndex: 'level',
      render: function (data, row) {
        return _.get(AAA_Level_UI_Type, row.level)
      }
    }
  ]
  const columnsMap = {
    [AAAServerTypeEnum.RADIUS]: radiusColumns,
    [AAAServerTypeEnum.TACACS]: tacacsColumns,
    [AAAServerTypeEnum.LOCAL_USER]: localUserColumns
  }

  return columnsMap[type]
}

const defaultPayload = {
  venueId: '4c778ed630394b76b17bce7fe230cf9f',
  serverType: AAAServerTypeEnum.RADIUS,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const AAAServerTable = (props: { type:AAAServerTypeEnum }) => {
  const { $t } = useIntl()
  const payloadMap = {
    [AAAServerTypeEnum.RADIUS]: { ...defaultPayload },
    [AAAServerTypeEnum.TACACS]: { ...defaultPayload, serverType: AAAServerTypeEnum.TACACS },
    [AAAServerTypeEnum.LOCAL_USER]: { ...defaultPayload, serverType: AAAServerTypeEnum.LOCAL_USER }
  }
  const tableQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload: payloadMap[props.type],
    pagination: {
      pageSize: 5
    }
  })

  const actions: TableProps<Venue>['actions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
    }
  }]

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Table
        columns={useColumns(props.type)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        actions={actions}
        rowSelection={{ type: 'checkbox' }}
      />
    </Loader>
  )
}

