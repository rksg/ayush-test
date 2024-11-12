import { useContext, useEffect, useRef, useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Table, TableProps }             from '@acx-ui/components'
import { ApSnmpActionType, SnmpV3Agent } from '@acx-ui/rc/utils'

import { HasAllPrivilegeEnabled } from './PrivilegeForm'
import SnmpAgentFormContext       from './SnmpAgentFormContext'
import SnmpV3AgentDrawer          from './SnmpV3AgentDrawer'



const SnmpAgentV3Table = () => {
  const { $t } = useIntl()
  const { state, dispatch } = useContext(SnmpAgentFormContext)

  const [ tableData, setTableData ] = useState<SnmpV3Agent[]>([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const editIdxRef = useRef(-1)

  useEffect(() => {
    const snmpV3List = state?.snmpV3Agents
    if (snmpV3List) {
      setTableData(snmpV3List)
    }
  }, [state])

  const columns: TableProps<SnmpV3Agent>['columns'] = [
    {
      key: 'userName',
      title: $t({ defaultMessage: 'User Name' }),
      dataIndex: 'userName'
    },{
      key: 'authProtocol',
      title: $t({ defaultMessage: 'Authentication' }),
      dataIndex: 'authProtocol'
    },{
      key: 'privacyProtocol',
      title: $t({ defaultMessage: 'Privacy' }),
      dataIndex: 'privacyProtocol'
    },{
      key: 'privilege',
      title: $t({ defaultMessage: 'Privilege' }),
      dataIndex: 'Privilege',
      render: function (_, row) {
        const { readPrivilege, trapPrivilege, notificationType } = row
        const displayList = []
        if (readPrivilege) {
          displayList.push('Read')
        }
        if (trapPrivilege) {
          displayList.push(`Notification-${notificationType}`)
        }
        return displayList.join('/')
      }
    },{
      key: 'targetAddr',
      title: $t({ defaultMessage: 'Notification Target' }),
      dataIndex: 'targetAddr',
      render: function (_, row) {
        const { targetAddr, targetPort } = row
        return (targetAddr)? `${targetAddr}:${targetPort}` : ''
      }
    }
  ]

  const rowActions: TableProps<SnmpV3Agent>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (selectedRows) => selectedRows.length === 1,
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      const selectedData = { ...selectedRows[0] }
      const idx = tableData.findIndex(r => r.userName === selectedData.userName)

      editIdxRef.current = idx
      setDrawerVisible(true)

      clearSelection()
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      dispatch({
        type: ApSnmpActionType.DELETE_SNMP_V3,
        payload: {
          names: selectedRows.map(row => row.userName)
        }
      })

      clearSelection()
    }
  }]

  const actions = [{
    label: $t({ defaultMessage: 'Add SNMPv3 Agent' }),
    disabled: drawerVisible || HasAllPrivilegeEnabled(tableData),
    onClick: () => {
      editIdxRef.current = -1
      setDrawerVisible(true)
    }
  }]


  return (<>
    <SnmpV3AgentDrawer
      visible={drawerVisible}
      setVisible={setDrawerVisible}
      editIndex={editIdxRef.current}
    />
    <Typography.Title level={4}>{$t({ defaultMessage: 'SNMPv3 Agent' })}</Typography.Title>
    <Table
      columns={columns}
      dataSource={tableData}
      rowKey='userName'
      actions={actions}
      rowActions={rowActions}
      rowSelection={{ type: 'checkbox' }}
    />
  </>)
}

export default SnmpAgentV3Table
