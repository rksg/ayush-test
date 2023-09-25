import { useEffect, useRef, useState } from 'react'

import { Form, Typography } from 'antd'
import { useIntl }          from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'
import { SnmpV2Agent }       from '@acx-ui/rc/utils'

import { HasAllPrivilegeEnabled } from './PrivilegeForm'
import SnmpV2AgentDrawer          from './SnmpV2AgentDrawer'


type SnmpAgentV2TableProps = {
  data: SnmpV2Agent[]
}

const initSnmpV2Agent = {
  communityName: '',
  readPrivilege: false,
  trapPrivilege: false
}

const SnmpAgentV2Table = (props: SnmpAgentV2TableProps) => {
  const { $t } = useIntl()
  const { data } = props
  const form = Form.useFormInstance()

  const [ tableData, setTableData ] = useState<SnmpV2Agent[]>([])
  const [ drawerState, setDrawerState ] = useState({
    visible: false,
    isEditMode: false,
    curData: initSnmpV2Agent,
    othersData: [] as SnmpV2Agent[]
  })
  const drawerVisible = drawerState.visible
  const editIdxRef = useRef(-1)

  useEffect(() => {
    if (data) {
      setTableData(data)
    }
  }, [data])

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

  const rowActions: TableProps<SnmpV2Agent>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      disabled: drawerVisible,
      onClick: (selectedRows, clearSelection) => {
        const selectedData = { ...selectedRows[0] }
        const idx = tableData.findIndex(r => r.communityName === selectedData.communityName)
        const others = tableData.filter(r => r.communityName !== selectedData.communityName)

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
        const keys = selectedRows.map(row => row.communityName)
        const newData = tableData.filter(r => keys.indexOf(r.communityName) === -1)
        setTableData(newData)
        clearSelection()

        // update form data
        form.setFieldValue('snmpV2Agents', newData)
      }
    }
  ]

  const handleAddAction = () => {
    editIdxRef.current = -1

    setDrawerState({
      ...drawerState,
      isEditMode: false,
      curData: initSnmpV2Agent,
      othersData: tableData,
      visible: true
    })

  }

  const actions = [
    {
      label: $t({ defaultMessage: 'Add SNMPv2 Agent' }),
      onClick: handleAddAction,
      disabled: drawerVisible || HasAllPrivilegeEnabled(tableData)
    }
  ]

  const handleSnmpV2AgentUpdate = (changedData: SnmpV2Agent) => {
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
    form.setFieldValue('snmpV2Agents', newData)
  }

  const handleDrawerCancel = () => {
    setDrawerState({
      ...drawerState,
      visible: false
    })
  }

  return (
    <>
      <SnmpV2AgentDrawer
        {...drawerState}
        onDataChanged={handleSnmpV2AgentUpdate}
        onCancel={handleDrawerCancel}
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
    </>
  )
}

export default SnmpAgentV2Table
