import { Input }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { AAAServerTypeEnum, RadiusServer, TacacsServer, LocalUser } from '@acx-ui/rc/utils'

import { AAA_Level_UI_Type, AAA_Purpose_UI_Type } from './contentsMap'

function useColumns (type: AAAServerTypeEnum) {
  const { $t } = useIntl()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      key: 'secret',
      dataIndex: 'secret',
      render: function (data, row) {
        return <div onClick={(e)=> {e.stopPropagation()}}>
          <Input.Password
            readOnly
            bordered={false}
            value={row.secret}
          />
        </div>
      }
    }
  ]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      key: 'secret',
      dataIndex: 'secret',
      render: function (data, row) {
        return <div onClick={(e)=> {e.stopPropagation()}}>
          <Input.Password
            readOnly
            bordered={false}
            value={row.secret}
          />
        </div>
      }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const localUserColumns: TableProps<any>['columns'] = [
    {
      title: $t({ defaultMessage: 'Username' }),
      key: 'username',
      dataIndex: 'username'
    },
    {
      title: $t({ defaultMessage: 'Password' }),
      key: 'password',
      dataIndex: 'password',
      render: function (data, row) {
        return <div onClick={(e)=> {e.stopPropagation()}}>
          <Input.Password
            readOnly
            bordered={false}
            value={row.password}
          />
        </div>
      }
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AAAServerTable = (props: { type:AAAServerTypeEnum, tableQuery: any }) => {
  const { $t } = useIntl()
  const { type, tableQuery } = props
  const addButtonText = {
    [AAAServerTypeEnum.RADIUS]: $t({ defaultMessage: 'Add RADIUS Server' }),
    [AAAServerTypeEnum.TACACS]: $t({ defaultMessage: 'Add TACACS+ Server' }),
    [AAAServerTypeEnum.LOCAL_USER]: $t({ defaultMessage: 'Add Local User' })
  }
  const actions: TableProps<RadiusServer | TacacsServer | LocalUser>['actions'] = [{
    label: addButtonText[type],
    onClick: () => {
    }
  }]

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Table
        columns={useColumns(type)}
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

