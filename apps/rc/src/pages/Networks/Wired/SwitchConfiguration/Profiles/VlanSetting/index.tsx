import { useState } from 'react'

import { Row, Col, Form } from 'antd'

import { showActionModal, Table, TableProps }           from '@acx-ui/components'
import { StepsForm }                   from '@acx-ui/components'
import { useSwitchConfigProfileQuery } from '@acx-ui/rc/services'
import {
  Vlan,
  SwitchModel,
  SpanningTreeProtocolName } from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

import { DefaultVlanDrawer } from './DefaultVlanDrawer'
import { VlanSettingDrawer } from './VlanSettingDrawer'

export function VlanSetting () {
  const { $t } = getIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const { data } = useSwitchConfigProfileQuery({ params }, { skip: !params.profileId })
  const [ vlanTable, setVlanTable ] = useState<Vlan[]>([])
  const [ defaultVlan, setDefaultVlan ] = useState<Vlan>()
  const [ drawerFormRule, setDrawerFormRule ] = useState<Vlan>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ vlanDrawerVisible, setVlanDrawerVisible ] = useState(false)
  const [ defaultVlanDrawerVisible, setDefaultVlanDrawerVisible ] = useState(false)

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
          const taggedPortsCount = row.taggedPorts?.length ?? 0
          const untaggedPortsCount = row.untaggedPorts?.length ?? 0
          return result + taggedPortsCount + untaggedPortsCount
        }, 0)
        : 0
    }
  }]

  const handleSetVlan = (data: Vlan) => {
    const isExist = vlanTable.filter((item: { vlanId: number }) => item.vlanId === data.vlanId)
    if(drawerEditMode && isExist.length > 0){
      const vlans = vlanTable.map((item: { vlanId: number }) => {
        if(item.vlanId === data.vlanId){
          return { ...data }
        }
        return item
      })
      setVlanTable(vlans as Vlan[])
    }else{
      setVlanTable([...vlanTable, data])
    }
    form.setFieldValue('vlans', [...vlanTable, data])
    return true
  }

  const handleSetDefaultVlan = (data: Vlan) => {
    const vlans = form.getFieldValue('vlans')
    form.setFieldValue('vlans', [...vlans, data])
    setDefaultVlan(data)
    return true
  }


  const rowActions: TableProps<Vlan>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setDrawerFormRule(selectedRows[0])
        setVlanDrawerVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows) => {
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
            rowActions={rowActions}
            dataSource={vlanTable}
            rowSelection={{
              type: 'radio',
              selectedRowKeys: drawerFormRule ? [drawerFormRule.vlanId] : [],
              onChange: (keys: React.Key[]) => {
                setDrawerFormRule(
                  vlanTable?.find((i: { vlanId: number }) => i.vlanId === keys[0])
                )
              }
            }}
            actions={[{
              label: $t({ defaultMessage: 'Add VLAN' }),
              onClick: () => { setVlanDrawerVisible(true) }
            }, {
              label: defaultVlan?.vlanId ?
                $t({ defaultMessage: 'Default ({vlanId}) VLAN settings' },
                  { vlanId: defaultVlan?.vlanId }) :
                $t({ defaultMessage: 'Default VLAN settings' }),
              onClick: () => { setDefaultVlanDrawerVisible(true) }
            }]} />
        </Col>
      </Row>
      <VlanSettingDrawer
        editMode={drawerEditMode}
        visible={vlanDrawerVisible}
        setVisible={setVlanDrawerVisible}
        vlan={(drawerFormRule)}
        setVlan={handleSetVlan}
        vlansList={vlanTable}
      />
      <DefaultVlanDrawer
        visible={defaultVlanDrawerVisible}
        setVisible={setDefaultVlanDrawerVisible}
        defaultVlan={defaultVlan}
        setDefaultVlan={handleSetDefaultVlan}
        vlansList={vlanTable}
      />
      <Form.Item name='vlans' initialValue={vlanTable} />
    </>
  )
}