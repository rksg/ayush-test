import { useContext, useState, useEffect, Key } from 'react'

import { Row, Col, Form, Input } from 'antd'
import _                         from 'lodash'

import { showActionModal, Table, TableProps, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { VlanSettingDrawer }                                            from '@acx-ui/rc/components'
import {
  Vlan,
  SwitchModel,
  SpanningTreeProtocolName,
  sortProp,
  defaultSort
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'
import { getIntl }        from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import { DefaultVlanDrawer } from './DefaultVlanDrawer'
import * as UI               from './styledComponents'

export function VlanSetting () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData, editMode } = useContext(ConfigurationProfileFormContext)
  const [ vlanTable, setVlanTable ] = useState<Vlan[]>([])
  const [ defaultVlan, setDefaultVlan ] = useState<Vlan>()
  const [ drawerFormRule, setDrawerFormRule ] = useState<Vlan>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ vlanDrawerVisible, setVlanDrawerVisible ] = useState(false)
  const [ defaultVlanDrawerVisible, setDefaultVlanDrawerVisible ] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Key[]>([])

  useEffect(() => {
    if(currentData.vlans){
      form.setFieldsValue(currentData)

      const defaultVlanData = currentData.vlans.filter(
        item => item.vlanName === 'DEFAULT-VLAN' )[0] || {}
      setDefaultVlan(defaultVlanData)

      const vlanList = currentData.vlans.filter(item => item.vlanName !== 'DEFAULT-VLAN' )
      setVlanTable(vlanList)
    }
  }, [currentData, editMode])

  const vlansColumns: TableProps<Vlan>['columns']= [{
    title: $t({ defaultMessage: 'VLAN ID' }),
    dataIndex: 'vlanId',
    key: 'vlanId',
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('vlanId', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'VLAN Name' }),
    dataIndex: 'vlanName',
    key: 'vlanName',
    sorter: { compare: sortProp('vlanName', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'IGMP Snooping' }),
    dataIndex: 'igmpSnooping',
    key: 'igmpSnooping',
    sorter: { compare: sortProp('igmpSnooping', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'Multicast Version' }),
    dataIndex: 'multicastVersion',
    key: 'multicastVersion',
    sorter: { compare: sortProp('multicastVersion', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'Spanning Tree' }),
    dataIndex: 'spanningTreeProtocol',
    key: 'spanningTreeProtocol',
    sorter: { compare: sortProp('spanningTreeProtocol', defaultSort) },
    render: (data) => {
      return data ? SpanningTreeProtocolName[data as keyof typeof SpanningTreeProtocolName] : null
    }
  }, {
    title: $t({ defaultMessage: '# of Ports' }),
    dataIndex: 'switchFamilyModels',
    key: 'switchFamilyModels',
    render: (data, row) => {
      return <Tooltip
        title={row.switchFamilyModels && generateTooltips(row.switchFamilyModels)}
      >
        {data
          ? (data as Vlan['switchFamilyModels'])?.reduce((result:number, row: SwitchModel) => {
            const taggedPortsCount = row.taggedPorts ?
              row.taggedPorts?.toString().split(',').length : 0
            const untaggedPortsCount = row.untaggedPorts ?
              row.untaggedPorts?.toString().split(',').length : 0
            return result + taggedPortsCount + untaggedPortsCount
          }, 0)
          : 0}
      </Tooltip>
    }
  }]


  const generateTooltips = (switchFamilyModels: SwitchModel[]) => {
    const portTooltips = switchFamilyModels.map((item: SwitchModel) => {
      const model = item.model
      const untaggedPorts = item.untaggedPorts?.split(',').map(port => port.split('/')[2]).join(',')
      const taggedPorts = item.taggedPorts?.split(',').map(port => port.split('/')[2]).join(',')
      return {
        model,
        untaggedPorts,
        taggedPorts
      }
    })

    return <>{portTooltips.map((item, index) => (<div key={index}>
      <div>{item.model}</div>
      <div><UI.TagsOutlineIcon /><UI.PortSpan>{item.untaggedPorts || '--'}</UI.PortSpan></div>
      <div><UI.TagsSolidIcon /><UI.PortSpan>{item.taggedPorts || '--'}</UI.PortSpan></div>
    </div>))
    }</>
  }

  const handleSetVlan = (data: Vlan) => {
    const filterData = drawerFormRule?.vlanId ? vlanTable.filter(
      (item: { vlanId: number }) => item.vlanId.toString() !== drawerFormRule?.vlanId.toString()) :
      vlanTable

    const sfm = data.switchFamilyModels?.map(item => {
      return {
        ...item,
        untaggedPorts: Array.isArray(item.untaggedPorts) ?
          item.untaggedPorts?.join(',') : item.untaggedPorts,
        taggedPorts: Array.isArray(item.taggedPorts) ?
          item.taggedPorts?.join(',') : item.taggedPorts
      }
    })

    data.switchFamilyModels = sfm
    setVlanTable([...filterData, data])
    if(_.isEmpty(defaultVlan)){
      form.setFieldValue('vlans', [...filterData, data])
    }else{
      form.setFieldValue('vlans', [...filterData, data, defaultVlan])
    }
    setDrawerEditMode(false)
    setDrawerFormRule(undefined)
    setSelectedRows([])
    return true
  }

  const handleSetDefaultVlan = (data: Vlan) => {
    const vlans = form.getFieldValue('vlans') || []
    form.setFieldValue('vlans',
      [...vlans.filter((item: { vlanName: string }) => item.vlanName !== 'DEFAULT-VLAN'), data])
    setDefaultVlan(data)
    return true
  }


  const rowActions: TableProps<Vlan>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setDrawerFormRule(selectedRows[0])
        setDrawerEditMode(true)
        setVlanDrawerVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Vlan' }),
            entityValue: selectedRows[0].vlanId.toString()
          },
          onOk: () => {
            const vlanRows = vlanTable?.filter((option: { vlanId: number }) => {
              return !selectedRows
                .map((r) => r.vlanId)
                .includes(option.vlanId)
            })
            setVlanTable(vlanRows)
            if(_.isEmpty(defaultVlan)){
              form.setFieldValue('vlans', [...vlanRows])
            } else {
              form.setFieldValue('vlans', [...vlanRows, defaultVlan])
            }
            setDrawerEditMode(false)
            clearSelection()
          }
        })
      }
    }
  ]

  return (
    <>
      <Row gutter={20}>
        <Col span={20}>
          <StepsFormLegacy.Title children={$t({ defaultMessage: 'VLANs' })} />
          <Table
            rowKey='vlanId'
            columns={vlansColumns}
            rowActions={filterByAccess(rowActions)}
            dataSource={vlanTable}
            rowSelection={{
              type: 'radio',
              selectedRowKeys: selectedRows,
              onChange: (keys: React.Key[]) => {
                setDrawerFormRule(
                  vlanTable?.find((i: { vlanId: number }) => i.vlanId === keys[0])
                )
              }
            }}
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Add VLAN' }),
              onClick: () => {
                form.resetFields()
                setDrawerFormRule({} as Vlan)
                setDrawerEditMode(false)
                setVlanDrawerVisible(true)
              }
            }, {
              label: defaultVlan?.vlanId ?
                $t({ defaultMessage: 'Default ({vlanId}) VLAN settings' },
                  { vlanId: defaultVlan?.vlanId }) :
                $t({ defaultMessage: 'Default VLAN settings' }),
              onClick: () => { setDefaultVlanDrawerVisible(true) }
            }])} />
        </Col>
      </Row>
      <VlanSettingDrawer
        editMode={drawerEditMode}
        visible={vlanDrawerVisible}
        setVisible={setVlanDrawerVisible}
        vlan={(drawerFormRule)}
        setVlan={handleSetVlan}
        vlansList={vlanTable.filter(item=>item.vlanId !== drawerFormRule?.vlanId)}
      />
      <DefaultVlanDrawer
        visible={defaultVlanDrawerVisible}
        setVisible={setDefaultVlanDrawerVisible}
        defaultVlan={defaultVlan}
        setDefaultVlan={handleSetDefaultVlan}
        vlansList={vlanTable}
      />
      <Form.Item
        name='vlans'
        hidden={true}
        children={<Input />}
      />
    </>
  )
}
