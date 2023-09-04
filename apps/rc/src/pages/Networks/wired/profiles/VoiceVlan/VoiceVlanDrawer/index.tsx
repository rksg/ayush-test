/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer, Table, TableProps }            from '@acx-ui/components'
import { Vlan, VoiceVlanModalData, VoiceVlanOption, VoiceVlanPort, TaggedVlanPorts, VoiceVlanConfig } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }            from '@acx-ui/user'
import { noDataDisplay, TABLE_DEFAULT_PAGE_SIZE }                        from '@acx-ui/utils'

import { VoiceVlanModal } from './VoiceVlanModal'
import _ from 'lodash'
import { DefaultOptionType } from 'antd/lib/select'

export interface ACLSettingDrawerProps {
  modelVlanOptions?: VoiceVlanOption
  modelVlanConfigs?: VoiceVlanConfig
  visible: boolean
  setVisible: (v: boolean) => void
  updateVoiceVlanConfigs: (model: string, voiceVlans: TaggedVlanPorts[]) => void
}

interface PortVlanMap {
  [key:string]: string[]
}

interface PortVoiceVlanMap {
  [key:string]: string
}

export function VoiceVlanDrawer (props: ACLSettingDrawerProps) {
  const { $t } = useIntl()
  const { modelVlanOptions, modelVlanConfigs, visible, setVisible, updateVoiceVlanConfigs } = props
  const [tableData, setTableData] = useState<VoiceVlanPort[]>([])
  const [editPorts, setEditPorts] = useState({} as VoiceVlanModalData)
  const [portVlanMap, setPortVlanMap] = useState<PortVlanMap>({})
  const [voiceVlanModalVisible, setVoiceVlanModalVisible] = useState(false)
  const [form] = Form.useForm<Vlan>()

  useEffect(() => {
    if(modelVlanOptions && visible){
      const portVlans:PortVlanMap = {}
      modelVlanOptions.taggedVlans.forEach(vlan => {
        vlan.taggedPorts.forEach((port:string) => {
          if(!portVlans[port]){
            portVlans[port] = [String(vlan.vlanId)]
          }else {
            portVlans[port].push(String(vlan.vlanId))
          }
        })
      })
      const portVoiceVlanMap:PortVoiceVlanMap = {}
      modelVlanConfigs?.voiceVlans.forEach(config => {
        config.taggedPorts.forEach((port:string) => {
          portVoiceVlanMap[port] = String(config.vlanId)
      })})
      const portList = Object.keys(portVlans).sort((a:string, b:string) => {
        if(a.split('/')[2] && b.split('/')[2]) {
          return Number(a.split('/')[2]) - Number(b.split('/')[2])
        }
        return 1
      })
      const tmpdata = portList.map(port => ({
        taggedPort: port,
        voiceVlan: portVoiceVlanMap[port] || ''
      }))
      setPortVlanMap(portVlans)
      setTableData(tmpdata)
    }
  }, [modelVlanOptions, visible])

  const onClose = () => {
    setVisible(false)
  }

  const onEdit = (selectedRows: VoiceVlanPort[]) => {
    const portsCopy = [...selectedRows]
    let vlans: string[] = []
    let intersection: string[] = []
    let union: string[] = []
    Object.keys(portVlanMap).forEach(key => {
      portsCopy.forEach(port => {
        if(key == port.taggedPort) {
          if(!vlans.length){
            vlans = [ ...portVlanMap[key]]
            union = [ ...portVlanMap[key]]
            intersection = [ ...portVlanMap[key]]
          }else {
            union = _.union(union, portVlanMap[key])
            intersection = _.intersection(intersection, portVlanMap[key])
          }
        }
      })
    })

    let vlansOption:DefaultOptionType[] = []
    if(selectedRows.length === 1) {
      vlansOption = vlans.map(i => ({
        label: $t( { defaultMessage: 'VLAN-ID: {id}' }, { id: i }),
        value: i
      }))
    }else{
      union.forEach(u => {
        if(intersection.indexOf(u) !== -1) {
          vlansOption.push({
            label: $t( { defaultMessage: 'VLAN-ID: {id}' }, { id: u }),
            value: u
          })
        } else {
          vlansOption.push({
            label: $t( { defaultMessage: 'VLAN-ID: {id} (Disjoint set of VLAN)' }, { id: u }),
            value: u,
            disabled: true
          })
        }
      })
    }

    const initialOption = [{
      label: $t({ defaultMessage: 'Not Set' }),
      value: ''
    }]
    vlansOption.sort((a, b) => Number(a.value) - Number(b.value))
    const vlanOptions = vlansOption ? [...initialOption, ...vlansOption] : initialOption

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
    const voiceVlans: any = [] 
    Object.keys(voiceVlanPortMap).forEach(key=> {
      voiceVlans.push({
        vlanId: key,
        taggedPorts: voiceVlanPortMap[key]
      })
    })
    if(modelVlanOptions?.model) {
      updateVoiceVlanConfigs(modelVlanOptions?.model, voiceVlans)
    }
    onClose()
  }

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'Set Voice VLAN ({model})' }, { model: modelVlanOptions?.model })}
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
              {$t({ defaultMessage: 'Set' })}
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