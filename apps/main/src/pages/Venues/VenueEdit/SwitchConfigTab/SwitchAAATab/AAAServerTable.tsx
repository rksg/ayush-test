import { useState } from 'react'

import { Input }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { useDeleteAAAServerMutation }                               from '@acx-ui/rc/services'
import { AAAServerTypeEnum, RadiusServer, TacacsServer, LocalUser } from '@acx-ui/rc/utils'
import { useParams }                                                from '@acx-ui/react-router-dom'

import AAAServerDrawer                                                                                from './AAAServerDrawer'
import { AAA_Purpose_Type, AAA_Level_Type, purposeDisplayText, serversDisplayText, levelDisplayText } from './contentsMap'

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
      render: function (data) {
        return $t(purposeDisplayText[data as AAA_Purpose_Type]) 
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
      render: function (data) {
        return $t(levelDisplayText[data as AAA_Level_Type])
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
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const { tenantId } = useParams()
  const [
    deleteAAAServer,
    { isLoading: isDeleting }
  ] = useDeleteAAAServerMutation()
  const { type, tableQuery } = props

  const handleAddAction = () => {
    setIsEditMode(false)
    setEditData({})  
    setVisible(true)
  }
  const actions: TableProps<RadiusServer | TacacsServer | LocalUser>['actions'] = [{
    label: $t({ defaultMessage: 'Add' }) + ' ' +　$t(serversDisplayText[type]),
    onClick: handleAddAction
  }]

  const rowActions: TableProps<RadiusServer | TacacsServer | LocalUser>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setIsEditMode(true)
        setEditData(selectedRows[0])
        setVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t(serversDisplayText[type]),
            entityValue: name
          },
          onOk: () => deleteAAAServer({ params: { tenantId, aaaServerId: id } })
            .then(clearSelection)
        })
      }
    }]

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleting }
    ]}>
      <AAAServerDrawer 
        visible={visible}
        setVisible={setVisible}
        isEditMode={isEditMode}
        editData={editData}
        serverType={type}
      />
      <Table
        columns={useColumns(type)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
      />
    </Loader>
  )
}

