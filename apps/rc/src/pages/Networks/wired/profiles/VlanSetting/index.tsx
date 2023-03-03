import { useContext, useState, useEffect } from 'react'

import { Row, Col, Form, Input } from 'antd'

import { showActionModal, Table, TableProps, StepsForm } from '@acx-ui/components'
import { hasAccesses }                                   from '@acx-ui/rbac'
import {
  Vlan,
  SwitchModel,
  SpanningTreeProtocolName } from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import { DefaultVlanDrawer } from './DefaultVlanDrawer'
import { VlanSettingDrawer } from './VlanSettingDrawer'

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

  useEffect(() => {
    if(currentData.vlans && editMode){
      form.setFieldsValue(currentData)
      setVlanTable(currentData.vlans)
    }
  }, [currentData, editMode])

  const vlansColumns: TableProps<Vlan>['columns']= [{
    title: $t({ defaultMessage: 'VLAN ID' }),
    dataIndex: 'vlanId',
    key: 'vlanId'
  }, {
    title: $t({ defaultMessage: 'VLAN Name' }),
    dataIndex: 'vlanName',
    key: 'vlanName'
  }, {
    title: $t({ defaultMessage: 'IGMP Snooping' }),
    dataIndex: 'igmpSnooping',
    key: 'igmpSnooping'
  }, {
    title: $t({ defaultMessage: 'Multicast Version' }),
    dataIndex: 'multicastVersion',
    key: 'multicastVersion'
  }, {
    title: $t({ defaultMessage: 'Spanning Tree' }),
    dataIndex: 'spanningTreeProtocol',
    key: 'spanningTreeProtocol',
    render: (data) => {
      return data ? SpanningTreeProtocolName[data as keyof typeof SpanningTreeProtocolName] : null
    }
  }, {
    title: $t({ defaultMessage: '# of Ports' }),
    dataIndex: 'switchFamilyModels',
    key: 'switchFamilyModels',
    render: (data) => {
      return data
        ? (data as Vlan['switchFamilyModels'])?.reduce((result:number, row: SwitchModel) => {
          const taggedPortsCount = row.taggedPorts ?
            row.taggedPorts?.toString().split(',').length : 0
          const untaggedPortsCount = row.untaggedPorts ?
            row.untaggedPorts?.toString().split(',').length : 0
          return result + taggedPortsCount + untaggedPortsCount
        }, 0)
        : 0
    }
  }]

  const handleSetVlan = (data: Vlan) => {
    const filterData = vlanTable.filter(
      (item: { vlanId: number }) => item.vlanId.toString() !== data.vlanId.toString())

    setVlanTable([...filterData, data])
    form.setFieldValue('vlans', [...filterData, data])
    setDrawerEditMode(false)
    return true
  }

  const handleSetDefaultVlan = (data: Vlan) => {
    const vlans = form.getFieldValue('vlans') || []
    form.setFieldValue('vlans', [...vlans, data])
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
            setVlanTable(
              vlanTable?.filter((option: { vlanId: number }) => {
                return !selectedRows
                  .map((r) => r.vlanId)
                  .includes(option.vlanId)
              })
            )
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
          <StepsForm.Title children={$t({ defaultMessage: 'VLANs' })} />
          <Table
            rowKey='vlanId'
            columns={vlansColumns}
            rowActions={hasAccesses(rowActions)}
            dataSource={vlanTable}
            rowSelection={{
              type: 'radio',
              onChange: (keys: React.Key[]) => {
                setDrawerFormRule(
                  vlanTable?.find((i: { vlanId: number }) => i.vlanId === keys[0])
                )
              }
            }}
            actions={hasAccesses([{
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
