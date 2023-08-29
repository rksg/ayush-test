/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select
} from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Alert, Tooltip, Table, TableProps }                            from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                        from '@acx-ui/icons'
import { validateDuplicateVlanName, validateVlanName, Vlan, VoiceVlanOption, VoiceVlanPort } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { noDataDisplay } from '@acx-ui/utils'
import { VoiceVlanModal } from './VoiceVlanModal'

export interface ACLSettingDrawerProps {
  modelData?: VoiceVlanOption
  setDefaultVlan: (r: Vlan) => void
  visible: boolean
  setVisible: (v: boolean) => void
  isRuleUnique?: (r: Vlan) => boolean
  vlansList: Vlan[]
}

export function VoiceVlanDrawer (props: ACLSettingDrawerProps) {
  const { $t } = useIntl()
  const { modelData, setDefaultVlan, visible, setVisible, vlansList } = props
  const [tableData, setTableData] = useState([] as VoiceVlanPort[])
  const [editPorts, setEditPorts] = useState([] as VoiceVlanPort[])
  const [voiceVlanModalVisible, setVoiceVlanModalVisible] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([] as string[])
  const [form] = Form.useForm<Vlan>()
  

  useEffect(() => {
    if(modelData){
      const portsMap:{[key:string]:string[]} = {}
      modelData.voiceVlans.forEach(vlan => {
        vlan.taggedPorts.forEach((port:string) => {
          if(!portsMap[port]){
            portsMap[port] = [String(vlan.vlanId)]
          }else {
            portsMap[port].push(String(vlan.vlanId))
          }
        })
      })
      const portList = Object.keys(portsMap).sort((a:string, b:string) => {
        if(a.split('/')[2] && b.split('/')[2]) {
          return Number(a.split('/')[2]) -  Number(b.split('/')[2])
        }
        return 1
      })
      const tmpdata = portList.map(port => ({
        taggedPort: port,
        voiceVlan:  ''
      }))
      setTableData(tmpdata)
    }
  }, [modelData])

  const onClose = () => {
    setVisible(false)
  }

  const columns: TableProps<VoiceVlanPort>['columns'] = [{
    title: $t({ defaultMessage: 'Tagged Ports' }),
    dataIndex: 'taggedPort',
    key: 'taggedPort',
  }, {
    title: $t({ defaultMessage: 'Voice VLAN' }),
    dataIndex: 'voiceVlan',
    key: 'voiceVlan',
    render: (_, row) => {
      return row.voiceVlan || noDataDisplay
    }
  }]

  const PortTable = () => {
    const rowActions: TableProps<VoiceVlanPort>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Edit' }),
        onClick: (selectedRows) => {
          // setDrawerFormRule(selectedRows[0])
          // setSelectedKeys(selectedRows.map(i => i.taggedPort))
          setEditPorts(selectedRows)
          setVoiceVlanModalVisible(true)
        }
      }
    ]
    return <Table
      rowKey='taggedPort'
      rowActions={filterByAccess(rowActions)}
      columns={columns}
      dataSource={tableData}
      rowSelection={hasAccess() && { 
        type: 'checkbox',
        // selectedRowKeys: selectedKeys 
      }}
    />
  }

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'Set Voice VLAN ({model})' },  { model: modelData?.model })}
        width={'400px'}
        visible={visible}
        onClose={onClose}
        destroyOnClose={true}
        children={
          <PortTable />
        }
        footer={
          <Drawer.FormFooter
            buttonLabel={{
              save: $t({ defaultMessage: 'Save' })
            }}
            onCancel={onClose}
            onSave={async () => {
              try {
                await form.validateFields()
                form.submit()
                onClose()
              } catch (error) {
                if (error instanceof Error) throw error
              }
            }}
          />
        }
      />
      <VoiceVlanModal
        visible={voiceVlanModalVisible}
        handleCancel={() => setVoiceVlanModalVisible(false)}
        editPorts={editPorts}
        tableData={tableData}
        setTableData={setTableData}
      />
    </>
  )
}
