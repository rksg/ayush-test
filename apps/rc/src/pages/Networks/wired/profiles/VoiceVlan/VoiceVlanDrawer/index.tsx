/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer, Table, TableProps }            from '@acx-ui/components'
import { Vlan, VoiceVlanModalData, VoiceVlanOption, VoiceVlanPort } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }            from '@acx-ui/user'
import { noDataDisplay, TABLE_DEFAULT_PAGE_SIZE }                        from '@acx-ui/utils'

import { VoiceVlanModal } from './VoiceVlanModal'
import _ from 'lodash'

export interface ACLSettingDrawerProps {
  modelData?: VoiceVlanOption
  visible: boolean
  setVisible: (v: boolean) => void
}

interface PortVlanMap {
  [key:string]: string[]
}

export function VoiceVlanDrawer (props: ACLSettingDrawerProps) {
  const { $t } = useIntl()
  const { modelData, visible, setVisible } = props
  const [tableData, setTableData] = useState<VoiceVlanPort[]>([])
  const [editPorts, setEditPorts] = useState({} as VoiceVlanModalData)
  const [portVlanMap, setPortVlanMap] = useState<PortVlanMap>({})
  const [voiceVlanModalVisible, setVoiceVlanModalVisible] = useState(false)
  const [form] = Form.useForm<Vlan>()

  useEffect(() => {
    if(modelData && visible){
      const portVlans:PortVlanMap = {}
      modelData.taggedVlans.forEach(vlan => {
        vlan.taggedPorts.forEach((port:string) => {
          if(!portVlans[port]){
            portVlans[port] = [String(vlan.vlanId)]
          }else {
            portVlans[port].push(String(vlan.vlanId))
          }
        })
      })
      const portList = Object.keys(portVlans).sort((a:string, b:string) => {
        if(a.split('/')[2] && b.split('/')[2]) {
          return Number(a.split('/')[2]) - Number(b.split('/')[2])
        }
        return 1
      })
      const tmpdata = portList.map(port => ({
        taggedPort: port,
        voiceVlan: ''
      }))
      setPortVlanMap(portVlans)
      setTableData(tmpdata)
    }
  }, [modelData, visible])

  const onClose = () => {
    setVisible(false)
  }

  const onEdit = (selectedRows: VoiceVlanPort[]) => {
    const portsCopy = [...selectedRows]
    let vlanOptions: string[] = []
    Object.keys(portVlanMap).forEach(key => {
      portsCopy.forEach(port => {
        if(key == port.taggedPort) {
          if(!vlanOptions.length){
            vlanOptions = [ ...portVlanMap[key]]
          }else {
            vlanOptions = _.intersection(vlanOptions, portVlanMap[key])
          }
        }
      })
    })
    const ports = selectedRows.map(i => i.taggedPort)
    let voiceVlanValue = selectedRows[0].voiceVlan
    if(selectedRows.length) {
      if(selectedRows.find(row => row.voiceVlan !== voiceVlanValue) !== undefined) {
        voiceVlanValue = '' // multiple voice VLANs
      }
    }
    setEditPorts({
      ports,
      vlanOptions: vlanOptions,
      voiceVlanValue: voiceVlanValue
    })
    setVoiceVlanModalVisible(true)
  }

  const onSave = () => {
    const voiceVlanPortMap:{[key:string]: string[]} = {}
    tableData.forEach(row => {
      if(row.voiceVlan) {
        if(voiceVlanPortMap[row.voiceVlan]) {
          voiceVlanPortMap[row.voiceVlan].push(row.taggedPort)
        }else{
          voiceVlanPortMap[row.voiceVlan] = [row.taggedPort]
        }
      }
    })
    const voiceVlanConfig: any = [] 
    Object.keys(voiceVlanPortMap).forEach(key=> {
      voiceVlanConfig.push({
        vlanId: key,
        taggedPorts: voiceVlanPortMap[key]
      })
    })
    console.log('voiceVlanConfig: ', voiceVlanConfig)
  }

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'Set Voice VLAN ({model})' }, { model: modelData?.model })}
        width={'400px'}
        visible={visible}
        onClose={onClose}
        destroyOnClose={true}
        children={
          <PortTable onEdit={onEdit} tableData={tableData}/>
        }
        footer={
          <>
          <div/>
          <div>
            <Button onClick={onClose}>
              {$t({ defaultMessage: 'Cancel' })}
            </Button>
            <Button
              onClick={onSave}
              type='primary'
            >
              {$t({ defaultMessage: 'Save' })}
            </Button>
          </div>
          </>
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

const PortTable = (props: { onEdit: (selectedRows: VoiceVlanPort[]) => void, tableData: VoiceVlanPort[] }) => {
  const { $t } = useIntl()
  const { onEdit, tableData } = props
  const columns: TableProps<VoiceVlanPort>['columns'] = [{
    title: $t({ defaultMessage: 'Tagged Ports' }),
    dataIndex: 'taggedPort',
    key: 'taggedPort'
  }, {
    title: $t({ defaultMessage: 'Voice VLAN' }),
    dataIndex: 'voiceVlan',
    key: 'voiceVlan',
    render: (_, row) => {
      return row.voiceVlan || noDataDisplay
    }
  }]

  const rowActions: TableProps<VoiceVlanPort>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: onEdit
    }
  ]

  return <Table
    rowKey='taggedPort'
    rowActions={filterByAccess(rowActions)}
    columns={columns}
    dataSource={tableData}
    pagination={{
      pageSize: TABLE_DEFAULT_PAGE_SIZE // fix: the initial page size is 20 here
    }}
    rowSelection={hasAccess() && {
      type: 'checkbox'
    }}
  />
}