import { useEffect, useRef, useState } from 'react'

import { Form, Typography } from 'antd'
import { useIntl }          from 'react-intl'

import { Table, TableProps }                                          from '@acx-ui/components'
import { SnmpAuthProtocolEnum, SnmpPrivacyProtocolEnum, SnmpV3Agent } from '@acx-ui/rc/utils'

import { HasAllPrivilegeEnabled } from './PrivilegeForm'
import SnmpV3AgentDrawer          from './SnmpV3AgentDrawer'


type SnmpAgentV3TableProps = {
  data: SnmpV3Agent[]
}

const initSnmpV3Agent = {
  userName: '',
  authProtocol: SnmpAuthProtocolEnum.SHA,
  authPassword: '',
  privacyProtocol: SnmpPrivacyProtocolEnum.None,
  readPrivilege: false,
  trapPrivilege: false
}

const SnmpAgentV3Table = (props: SnmpAgentV3TableProps) => {
  const { $t } = useIntl()
  const { data } = props
  const form = Form.useFormInstance()

  const [ tableData, setTableData ] = useState<SnmpV3Agent[]>([])
  const [ drawerState, setDrawerState ] = useState({
    visible: false,
    isEditMode: false,
    curData: initSnmpV3Agent,
    othersData: [] as SnmpV3Agent[]
  })
  const drawerVisible = drawerState.visible
  const editIdxRef = useRef(-1)

  useEffect(() => {
    if (data) {
      setTableData(data)
    }
  }, [data])

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

  const rowActions: TableProps<SnmpV3Agent>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      disabled: drawerVisible,
      onClick: (selectedRows, clearSelection) => {
        const selectedData = { ...selectedRows[0] }
        const idx = tableData.findIndex(r => r.userName === selectedData.userName)
        const others = tableData.filter(r => r.userName !== selectedData.userName)

        editIdxRef.current = idx

        setDrawerState({
          ...drawerState,
          isEditMode: true,
          curData: selectedData,
          othersData: others,
          visible: true
        })

        clearSelection()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: drawerVisible,
      onClick: (selectedRows, clearSelection) => {
        const keys = selectedRows.map(row => row.userName)
        const newData = tableData.filter(r => keys.indexOf(r.userName) === -1)
        setTableData(newData)
        clearSelection()
        // update form data
        form.setFieldValue('snmpV3Agents', newData)
      }
    }
  ]

  const handleAddAction = () => {
    editIdxRef.current = -1

    setDrawerState({
      ...drawerState,
      isEditMode: false,
      curData: initSnmpV3Agent,
      othersData: tableData,
      visible: true
    })
  }

  const actions = [
    {
      label: $t({ defaultMessage: 'Add SNMPv3 Agent' }),
      onClick: handleAddAction,
      disabled: drawerVisible || HasAllPrivilegeEnabled(tableData)
    }
  ]

  const handleSnmpV3AgentUpdate = (changedData: SnmpV3Agent) => {
    const newData = [ ...tableData ]
    const editIdx = editIdxRef.current

    if (editIdx === -1) {
      newData.push(changedData)
    } else {
      newData.splice(editIdx, 1, changedData)
    }

    setTableData(newData)

    setDrawerState({
      ...drawerState,
      othersData: newData
    })
    // update form data
    form.setFieldValue('snmpV3Agents', newData)
  }

  const handleDrawerCancel = () => {
    setDrawerState({
      ...drawerState,
      visible: false
    })
  }

  return (
    <>
      <SnmpV3AgentDrawer
        {...drawerState}
        onDataChanged={handleSnmpV3AgentUpdate}
        onCancel={handleDrawerCancel}
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
    </>
  )
}

export default SnmpAgentV3Table
