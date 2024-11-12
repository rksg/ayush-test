import { useContext, useEffect, useRef, useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Table, TableProps }             from '@acx-ui/components'
import { ApSnmpActionType, SnmpV2Agent } from '@acx-ui/rc/utils'

import { HasAllPrivilegeEnabled } from './PrivilegeForm'
import SnmpAgentFormContext       from './SnmpAgentFormContext'
import SnmpV2AgentDrawer          from './SnmpV2AgentDrawer'




const SnmpAgentV2Table = () => {
  const { $t } = useIntl()
  const { state, dispatch } = useContext(SnmpAgentFormContext)

  const [ tableData, setTableData ] = useState<SnmpV2Agent[]>([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const editIdxRef = useRef(-1)

  useEffect(() => {
    const snmpV2List = state?.snmpV2Agents
    if (snmpV2List) {
      setTableData(snmpV2List)
    }
  }, [state])

  const columns: TableProps<SnmpV2Agent>['columns'] = [
    {
      key: 'communityName',
      title: $t({ defaultMessage: 'Community Name' }),
      dataIndex: 'communityName'
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

  const rowActions: TableProps<SnmpV2Agent>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (selectedRows) => selectedRows.length === 1,
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      const selectedData = { ...selectedRows[0] }
      const idx = tableData.findIndex(r => r.communityName === selectedData.communityName)

      editIdxRef.current = idx
      setDrawerVisible(true)

      clearSelection()
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      dispatch({
        type: ApSnmpActionType.DELETE_SNMP_V2,
        payload: {
          names: selectedRows.map(row => row.communityName)
        }
      })

      clearSelection()
    }
  }]

  const actions = [{
    label: $t({ defaultMessage: 'Add SNMPv2 Agent' }),
    disabled: drawerVisible || HasAllPrivilegeEnabled(tableData),
    onClick: () => {
      editIdxRef.current = -1
      setDrawerVisible(true)
    }
  }]

  return (<>
    <SnmpV2AgentDrawer
      visible={drawerVisible}
      setVisible={setDrawerVisible}
      editIndex={editIdxRef.current}
    />
    <Typography.Title level={4}>{$t({ defaultMessage: 'SNMPv2 Agent' })}</Typography.Title>
    <Table
      columns={columns}
      dataSource={tableData}
      rowKey='communityName'
      actions={actions}
      rowActions={rowActions}
      rowSelection={{ type: 'checkbox' }}
    />
  </>)
}

export default SnmpAgentV2Table
