import { useState } from 'react'

import { Input }                     from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { useDeleteAAAServerMutation, useBulkDeleteAAAServerMutation }           from '@acx-ui/rc/services'
import { AAAServerTypeEnum, RadiusServer, TacacsServer, LocalUser, AAASetting } from '@acx-ui/rc/utils'
import { useParams }                                                            from '@acx-ui/react-router-dom'

import { AAAServerDrawer }                                                                                                    from './AAAServerDrawer'
import { AAA_Purpose_Type, AAA_Level_Type, purposeDisplayText, serversDisplayText, levelDisplayText, serversTypeDisplayText } from './contentsMap'

function useColumns (type: AAAServerTypeEnum) {
  const { $t } = useIntl()
  const radiusColumns: TableProps<RadiusServer & TacacsServer & LocalUser>['columns'] = [
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
  const tacacsColumns: TableProps<RadiusServer & TacacsServer & LocalUser>['columns'] = [
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
        return <FormattedMessage {...purposeDisplayText[data as AAA_Purpose_Type]}/>
      }
    }
  ]
  const localUserColumns: TableProps<RadiusServer & TacacsServer & LocalUser>['columns'] = [
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
        return <FormattedMessage {...levelDisplayText[data as AAA_Level_Type]}/>
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


export const AAAServerTable = (props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type:AAAServerTypeEnum, tableQuery: any, aaaSetting?:AAASetting }) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({} as RadiusServer | TacacsServer | LocalUser)
  const [disabledDelete, setDisabledDelete] = useState(false)
  const [deleteButtonTooltip, setDeleteButtonTooltip] = useState('')
  const { tenantId } = useParams()
  const [
    deleteAAAServer,
    { isLoading: isDeleting }
  ] = useDeleteAAAServerMutation()
  const [
    bulkDeleteAAAServer,
    { isLoading: isBulkDeleting }
  ] = useBulkDeleteAAAServerMutation()
  const { type, tableQuery, aaaSetting } = props

  const handleAddAction = () => {
    setIsEditMode(false)
    setEditData({} as RadiusServer | TacacsServer | LocalUser)
    setVisible(true)
  }
  const actions: TableProps<RadiusServer | TacacsServer | LocalUser>['actions'] = [{
    label: $t({ defaultMessage: 'Add {serverType}' }, { serverType: $t(serversDisplayText[type]) }),
    onClick: handleAddAction
  }]

  const checkAAASetting = (serverType: AAAServerTypeEnum) => {
    const a = aaaSetting || {} as AAASetting
    const result = []
    if (a.authnEnabledSsh) { // SSH Authentication
      if (a.authnFirstPref === serverType) { // First is radius or TACACS+
        if (!a.authnSecondPref || a.authnSecondPref === 'NONE_TYPE') { // Second is none or empty
          result.push($t({ defaultMessage: 'Log-in Authentication' }))
        }
      }
    }
    if (a.authzEnabledCommand) { // Command Authorization
      if (a.authzCommonsFirstServer === serverType) { // First is radius or TACACS+
        if (!a.authzCommonsSecondServer || a.authzCommonsSecondServer === 'NONE_TYPE') { // Second is none or empty
          result.push($t({ defaultMessage: 'Command Authorization' }))
        }
      }
    }
    if (a.authzEnabledExec) { // Executive Authorization
      if (a.authzExecFirstServer === serverType) { // First is radius or TACACS+
        if (!a.authzExecSecondServer || a.authzExecSecondServer === 'NONE_TYPE') { // Second is none or empty
          result.push($t({ defaultMessage: 'Executive Authorization' }))
        }
      }
    }
    if (a.acctEnabledCommand) { // Command Accounting
      if (a.acctCommonsFirstServer === serverType) { // First is radius or TACACS+
        if (!a.acctCommonsSecondServer || a.acctCommonsSecondServer === 'NONE_TYPE') { // Second is none or empty
          result.push($t({ defaultMessage: 'Command Accounting' }))
        }
      }
    }
    if (a.acctEnabledExec) { // Executive Accounting
      if (a.acctExecFirstServer === serverType) { // First is radius or TACACS+
        if (!a.acctExecSecondServer || a.acctExecSecondServer === 'NONE_TYPE') { // Second is none or empty
          result.push($t({ defaultMessage: 'Executive Accounting' }))
        }
      }
    }
    return result
  }

  const onSelectChange = (keys: React.Key[], rows: LocalUser[]) => {
    setDeleteButtonTooltip('')
    if (rows[0] && rows[0].serverType === AAAServerTypeEnum.LOCAL_USER) {
      const localAdmin = rows.find(i => i.username === 'admin')
      setDisabledDelete(!!localAdmin)
      if(!!localAdmin) {
        setDeleteButtonTooltip($t({ defaultMessage: 'The default user "admin" cannot be deleted' }))
      }
    }
  }

  const rowActions: TableProps<RadiusServer & TacacsServer & LocalUser>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setIsEditMode(true)
        setEditData(selectedRows[0])
        setVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: disabledDelete,
      tooltip: deleteButtonTooltip,
      onClick: (rows, clearSelection) => {
        let disableDeleteList:string[] = []
        if ((tableQuery.data?.totalCount === rows.length) &&
        (type === AAAServerTypeEnum.TACACS || type === AAAServerTypeEnum.RADIUS)) {
          disableDeleteList = checkAAASetting(type)
        }
        if (disableDeleteList.length) {
          showActionModal({
            type: 'info',
            title: $t({ defaultMessage: '{serverType} Server Required' },
              { serverType: $t(serversTypeDisplayText[type]) }),
            content: (<FormattedMessage
              defaultMessage={`
                  {serverType} servers are prioritized for the following: <br></br>
                  {disabledList}. <br></br>
                  In order to delete {count, plural, one {this} other {these}}
                  {serverType} {count, plural, one {server} other {servers}}
                  you must define a different method.
                `}
              values={{
                serverType: $t(serversTypeDisplayText[type]),
                disabledList: disableDeleteList.join($t({ defaultMessage: ', ' })),
                count: rows.length,
                br: () => <br />
              }}
            />)
          })
        } else {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t(serversDisplayText[type]),
              entityValue: rows.length === 1 ? rows[0].name : undefined,
              numOfEntities: rows.length
            },
            onOk: () => { rows.length === 1 ?
              deleteAAAServer({ params: { tenantId, aaaServerId: rows[0].id } })
                .then(clearSelection) :
              bulkDeleteAAAServer({ params: { tenantId }, payload: rows.map(item => item.id) })
                .then(clearSelection)
            }
          })
        }
      }
    }]

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleting || isBulkDeleting }
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
        rowSelection={{ type: 'checkbox', onChange: onSelectChange }}
      />
    </Loader>
  )
}

