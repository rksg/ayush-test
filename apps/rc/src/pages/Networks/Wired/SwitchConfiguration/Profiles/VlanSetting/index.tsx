import { useState } from 'react'

import { Row, Col } from 'antd'

import { Table, TableProps }           from '@acx-ui/components'
import { StepsForm }                   from '@acx-ui/components'
import { useSwitchConfigProfileQuery } from '@acx-ui/rc/services'
import {
  Vlan,
  SwitchModel,
  SpanningTreeProtocolName} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

import { DefaultVlanDrawer } from './DefaultVlanDrawer'
import { VlanSettingDrawer } from './VlanSettingDrawer'

export function VlanSetting () {
  const { $t } = getIntl()
  const params = useParams()
  const { data } = useSwitchConfigProfileQuery({ params }, { skip: !params.profileId })
  const [ vlanTable, setvlanTable ] = useState<Vlan[]>([])
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
          const taggedPortsCount = row.taggedPorts?.split(',').length ?? 0
          const untaggedPortsCount = row?.untaggedPorts?.split(',').length ?? 0
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
      setvlanTable(vlans as Vlan[])
    }else{
      setvlanTable([...vlanTable, data])
    }
    return true
  }

  const handleSetDefaultVlan = (data: Vlan) => {
    setDefaultVlan(data)
    return true
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={20}>
          <StepsForm.Title children={$t({ defaultMessage: 'VLANs' })} />
          <Table
            rowKey='id'
            columns={vlansColumns}
            dataSource={vlanTable}
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
        rule={(drawerFormRule)}
        visible={vlanDrawerVisible}
        setVisible={setVlanDrawerVisible}
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
    </>
  )
}