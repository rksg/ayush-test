import { useContext, useState, useEffect, Key, ReactNode } from 'react'

import { Row, Col, Form, Input } from 'antd'
import _                         from 'lodash'

import { showActionModal, Table, TableProps, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import {
  Vlan,
  SwitchModel,
  SpanningTreeProtocolName,
  sortProp,
  defaultSort
} from '@acx-ui/rc/utils'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { getIntl }                       from '@acx-ui/utils'

import { DefaultVlanDrawer }                 from '../../DefaultVlanDrawer'
import { VlanSettingDrawer, checkVlanRange } from '../../VlanSettingDrawer'
import { ConfigurationProfileFormContext }   from '../ConfigurationProfileFormContext'

import * as UI from './styledComponents'

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
  const isBulkVlanProvisioningEnabled = useIsSplitOn(Features.BULK_VLAN_PROVISIONING)

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
    render: (_, { spanningTreeProtocol }) => {
      return spanningTreeProtocol ? SpanningTreeProtocolName[spanningTreeProtocol] : null
    }
  },
  ...(!isBulkVlanProvisioningEnabled ? [{
    title: $t({ defaultMessage: '# of Ports' }),
    dataIndex: 'switchFamilyModels',
    key: 'switchFamilyModels',
    render: (_: ReactNode, row: Vlan) => {
      return <Tooltip
        title={row.switchFamilyModels && generateTooltips(row.switchFamilyModels)}
      >
        {row.switchFamilyModels
          ? row.switchFamilyModels?.reduce((result:number, row: SwitchModel) => {
            const taggedPortsCount = row.taggedPorts ?
              row.taggedPorts?.toString().split(',').length : 0
            const untaggedPortsCount = row.untaggedPorts ?
              row.untaggedPorts?.toString().split(',').length : 0
            return result + taggedPortsCount + untaggedPortsCount
          }, 0)
          : 0}
      </Tooltip>
    }
  }] : [])
  ]

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
    const hasIpV4Changed = !_.isEqual(drawerFormRule?.ipv4DhcpSnooping, data.ipv4DhcpSnooping)
    if (drawerEditMode && hasIpV4Changed) {
      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: 'Override Settings?' }),
        // eslint-disable-next-line max-len
        content: $t({ defaultMessage: 'Some of the VLANs in this range have a different \'IPv4 DHCP Snooping\' setting. Proceeding with this change will overwrite the previously configured on those VLANs with the current selection. ' }),
        okText: $t({ defaultMessage: 'Proceed' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        onOk: async () => {
          try {
            applySetVlan(data)
          } catch (error) {
            console.log(error) // eslint-disable-line no-console
          }
        }
      })
      return
    } else {
      applySetVlan(data)
    }
  }

  const applySetVlan = (data: Vlan) => {
    const { vlans } = checkVlanRange(data.vlanId.toString())
    const filterData = drawerFormRule?.vlanId ? vlanTable.filter(
      (item: { vlanId: number }) => item.vlanId.toString() !== drawerFormRule?.vlanId.toString()) :
      vlanTable

    const sfm = data.switchFamilyModels?.map((item, index) => {
      return {
        ...item,
        untaggedPorts: Array.isArray(item.untaggedPorts) ?
          item.untaggedPorts?.join(',') : item.untaggedPorts,
        taggedPorts: Array.isArray(item.taggedPorts) ?
          item.taggedPorts?.join(',') : item.taggedPorts,
        key: index
      }
    })

    const transformData = vlans.map((item) => {
      const isCloneSfm = !isBulkVlanProvisioningEnabled
      || drawerFormRule?.vlanId?.toString() === item
      || vlans?.length === 1

      return {
        ..._.omit(data, ['switchFamilyModels']),
        vlanId: Number(item),
        ...(isCloneSfm ? { switchFamilyModels: sfm } : {}
        )
      }
    })

    setVlanTable([...filterData, ...transformData])

    if (_.isEmpty(defaultVlan)) {
      form.setFieldValue('vlans', [...filterData, ...transformData])
    } else {
      form.setFieldValue('vlans', [...filterData, ...transformData, defaultVlan])
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
        const hasExtraContent = isBulkVlanProvisioningEnabled
          && selectedRows.find(row => row.switchFamilyModels?.length)

        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'VLAN' }),
            entityValue: selectedRows[0].vlanId.toString()
          },
          ...(hasExtraContent ? {
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: `This VLAN has already been configured on some ports (can be looked up in the Ports section). Deleting this VLAN will result in the port configuration getting updated. 
              {br}{br}Are you sure you want to delete this VLAN?` }, { br: <br/> })
          } : {}
          ),
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
            columns={vlansColumns}
            rowActions={filterByAccess(rowActions)}
            dataSource={vlanTable.map((item, index) => ({ ...item, key: index }))}
            rowSelection={hasPermission() && {
              type: 'radio',
              selectedRowKeys: selectedRows
            }}
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Add VLAN' }),
              onClick: () => {
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
        setVlan={isBulkVlanProvisioningEnabled
          ? handleSetVlan
          : applySetVlan
        }
        isProfileLevel={true}
        vlansList={
          vlanTable
            .filter(item=>item.vlanId !== drawerFormRule?.vlanId)
            .concat(defaultVlan && isBulkVlanProvisioningEnabled ? [defaultVlan] : [])
        }
        enablePortModelConfigure={!isBulkVlanProvisioningEnabled}
        enableVlanRangeConfigure={isBulkVlanProvisioningEnabled}
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
