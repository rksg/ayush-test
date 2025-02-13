import { useContext, useState, useEffect } from 'react'

import { Row, Col, Form, Input, Space, Typography } from 'antd'
import _                                            from 'lodash'

import { showActionModal, Table, TableProps, StepsForm } from '@acx-ui/components'
import { ArrowExpand, ArrowChevronRight }                from '@acx-ui/icons-new'
import {
  defaultSort,
  sortProp,
  SWITCH_DEFAULT_VLAN_NAME,
  SwitchVlans,
  Vlan
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'
import { getIntl }        from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import {
  checkIfModuleFixed,
  formatSlotConfigForSaving,
  getModuleKey,
  Slot
} from './index.utils'
import { PortsModal } from './PortsModal'
import * as UI        from './styledComponents'
export interface PortSetting {
  id?: string
  port: string
  untaggedVlan: string[]
  taggedVlans: string[]
}

export interface VlanPort {
  key: string
  familymodel?: string
  slots: Slot[]
  isDefaultModule: boolean,
  module?: string
  port?: string
  ports: PortSetting[]
}

export interface GroupedVlanPort {
  id: string ////
  familymodel: string
  groupbyModules: VlanPort[]
}

interface VlanMap {
  [vlan: string]: {
    model: string
    slots: Slot[]
    taggedPorts: string
    untaggedPorts: string
  };
}

export function VlanPortSetting () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData, editMode } = useContext(ConfigurationProfileFormContext)
  const [ vlanList, setVlanList ] = useState<Vlan[]>([])
  const [ vlanPortList, setVlanPortList ] = useState<GroupedVlanPort[]>([])
  const [ modalVisible, setModalVisible ] = useState(false)
  const [ selectedRow, setSelectedRow ] = useState<VlanPort>(null as unknown as VlanPort)

  const [ selectedModelKeys, setSelectedModelKeys ] = useState([] as string[])
  const [ selectedModuleKeys, setSelectedModuleKeys ] = useState([] as string[])

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('VlanPortSetting currentData: ', currentData)
    if(currentData.vlans){
      form.setFieldsValue(currentData)
      const vlanList = currentData.vlans.filter(
        item => item.vlanName !== SWITCH_DEFAULT_VLAN_NAME
      )
      const vlanPortList = currentData.vlans.reduce((result: GroupedVlanPort[], item: Vlan) => {
        if (!item.switchFamilyModels) return result

        item.switchFamilyModels.forEach((switchModel) => {
          const [family, model] = switchModel.model.split('-')
          const tagged = switchModel.taggedPorts ? switchModel.taggedPorts.split(',') : []
          const untagged = switchModel.untaggedPorts ? switchModel.untaggedPorts.split(',') : []
          const ports = [...tagged, ...untagged]
          const existingModel = result.find(list => list.familymodel === switchModel.model)

          const moduleFixed = checkIfModuleFixed(family, model)
          const isDefaultModule = moduleFixed?.moduleSelectionEnable === false
          const modulekey = getModuleKey(family, model, switchModel.slots)

          if (existingModel) {
            const existingModules
              = existingModel.groupbyModules.find(module => module.key === modulekey)

            if (existingModules) {
              ports.forEach((port) => {
                let existingPort = existingModules.ports?.find((p) => p.port === port)
                if (existingPort) {
                  if (untagged.includes(port)) {
                    existingPort.untaggedVlan.push(item.vlanId?.toString())
                    existingPort.untaggedVlan
                      = Array.from(new Set(existingPort.untaggedVlan)).sort()
                  }
                  if (tagged.includes(port)) {
                    existingPort.taggedVlans.push(item.vlanId?.toString())
                    existingPort.taggedVlans
                      = Array.from(new Set(existingPort.taggedVlans)).sort()
                  }
                } else {
                  existingModules.ports?.push({
                    id: `${switchModel.model}-${port}`,
                    port,
                    untaggedVlan: untagged.includes(port) ? [item.vlanId?.toString()] : [],
                    taggedVlans: tagged.includes(port) ? [item.vlanId?.toString()] : []
                  })
                }
              })
            } else {
              existingModel.groupbyModules.push({
                key: modulekey,
                familymodel: switchModel.model,
                isDefaultModule,
                slots: switchModel.slots as Slot[],
                ports: ports.map((port) => ({
                  id: `${switchModel.model}-${port}`,
                  port,
                  untaggedVlan: untagged.includes(port) ? [item.vlanId?.toString()] : [],
                  taggedVlans: tagged.includes(port) ? [item.vlanId?.toString()] : []
                }))
              })
            }
          } else {
            result.push({
              id: `${switchModel.model}`,
              familymodel: switchModel.model,
              groupbyModules: [
                {
                  key: modulekey,
                  familymodel: switchModel.model,
                  isDefaultModule,
                  slots: switchModel.slots as Slot[],
                  ports: ports.map((port) => ({
                    id: `${switchModel.model}-${port}`,
                    port,
                    untaggedVlan: untagged.includes(port) ? [item.vlanId?.toString()] : [],
                    taggedVlans: tagged.includes(port) ? [item.vlanId?.toString()] : []
                  }))
                }
              ]
            })
          }

        })

        return result
      }, [])

      setVlanList(vlanList)
      setVlanPortList(vlanPortList)

      // eslint-disable-next-line no-console
      console.log('vlanPortList: ', vlanPortList)
    }
  }, [currentData, editMode])

  const modelColumns: TableProps<GroupedVlanPort>['columns']= [{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'familymodel',
    key: 'familymodel',
    width: 900,
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('familymodel', defaultSort) },
    render: (_, data: GroupedVlanPort) => {
      const isDefaultModule = data?.groupbyModules.filter(module => module.isDefaultModule)?.length
      return <Space size={16}>
        <Typography.Text style={{ fontWeight: 700 }}>{ data.familymodel }</Typography.Text>
        { isDefaultModule
          ? <Typography.Text>
            { $t({ defaultMessage: 'Module: ' }) }
            <UI.ModelModuleText>{ $t({ defaultMessage: 'Default' }) }</UI.ModelModuleText>
          </Typography.Text>
          : <Typography.Text>
            { $t({ defaultMessage: 'Configured Modules: ' }) }
            <UI.ModelModuleText>{ data?.groupbyModules.length }</UI.ModelModuleText>
          </Typography.Text>
        }
      </Space>
    }
  }]

  const moduleColumns: TableProps<VlanPort>['columns']= [{
    title: $t({ defaultMessage: 'Module' }),
    dataIndex: 'key',
    key: 'key',
    width: 800,
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('key', defaultSort) },
    render: (_, data: VlanPort) => {
      const module2 = data.slots.find(s => s.slotNumber === 2)
      const module3 = data.slots.find(s => s.slotNumber === 3)
      return data.isDefaultModule
        ? <>
          <UI.ModuleTitle>{ $t({ defaultMessage: 'Module:' }) }</UI.ModuleTitle>
          <UI.ModuleDesp>{ $t({ defaultMessage: 'Default' }) }</UI.ModuleDesp>
        </>
        : <>
          <UI.ModuleTitle>{ $t({ defaultMessage: 'Module 2: ' }) }</UI.ModuleTitle>
          <UI.ModuleDesp>{ module2?.option.split('X').join(' X ') ?? '--' }</UI.ModuleDesp>
          <UI.ModuleDivider type='vertical'/>
          <UI.ModuleTitle>{ $t({ defaultMessage: 'Module 3: ' }) }</UI.ModuleTitle>
          <UI.ModuleDesp>{ module3?.option.split('X').join(' X ') ?? '--' }</UI.ModuleDesp>
        </>
    }
  }]

  const portColumns: TableProps<PortSetting>['columns']= [{
    title: $t({ defaultMessage: 'Port' }),
    dataIndex: 'port',
    key: 'port',
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('port', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'Untagged VLANs' }),
    dataIndex: 'untaggedVlan',
    key: 'untaggedVlan'
  }, {
    title: $t({ defaultMessage: 'Tagged VLANs' }),
    dataIndex: 'taggedVlans',
    key: 'taggedVlans',
    render: (_, data: PortSetting) => data.taggedVlans.join(', ')
  }]

  // const handleSetVlan = (data: Vlan) => {
  // }

  const rowActions: TableProps<GroupedVlanPort>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    disabled: () => selectedModuleKeys.length > 1,
    tooltip: selectedModuleKeys.length > 1
      // eslint-disable-next-line max-len
      ? $t({ defaultMessage: 'Editing is only possible if it\'s the same module within the same series.' })
      : '',
    onClick: () => {
      const selectedModel
        = vlanPortList.find(vlanPort => vlanPort.id === selectedModelKeys?.[0])
      const selectedRow = selectedModel?.groupbyModules.find(
        module => module.key === selectedModuleKeys?.[0]
      )
      setSelectedRow(selectedRow as VlanPort)
      setModalVisible(true)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows, clearSelection) => {
      const isSelectedOneModule = selectedModuleKeys.length === 1
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: isSelectedOneModule
            ? $t({ defaultMessage: 'Module' })
            : $t({ defaultMessage: 'Modules' }),
          entityValue: isSelectedOneModule ? selectedModuleKeys[0] : undefined,
          numOfEntities: selectedModuleKeys.length
        },
        onOk: () => { //TODO
          // const vlanRows = vlanTable?.filter((option: { vlanId: number }) => {
          //   return !selectedRows
          //     .map((r) => r.vlanId)
          //     .includes(option.vlanId)
          // })
          // setVlanTable(vlanRows)
          // if(_.isEmpty(defaultVlan)){
          //   form.setFieldValue('vlans', [...vlanRows])
          // } else {
          //   form.setFieldValue('vlans', [...vlanRows, defaultVlan])
          // }
          // setDrawerEditMode(false)
          clearSelection()
        }
      })
    }
  }]

  const expandIcon = ({ expanded, onExpand, record }: { //TODO
    expanded: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onExpand: (data: any, e: React.MouseEvent<HTMLElement>) => void, record: any
  }) => {
    return expanded ? (
      <ArrowExpand
        size='sm'
        style={{ verticalAlign: 'bottom' }}
        data-testid='arrow-expand'
        onClick={
          (e) => {
            e.stopPropagation()
            onExpand(record, e as unknown as React.MouseEvent<HTMLElement>)
          }} />
    ) : (
      <ArrowChevronRight
        size='sm'
        style={{ verticalAlign: 'bottom', height: '16px' }}
        data-testid='arrow-right'
        onClick={
          (e) => {
            e.stopPropagation()
            onExpand(record, e as unknown as React.MouseEvent<HTMLElement>)
          }} />
    )
  }

  return (<>
    <Row gutter={20}>
      <Col span={20}>
        <StepsForm.Title children={$t({ defaultMessage: 'Ports' })} />
        { vlanPortList?.length
          ? <UI.TableWrapper>
            <Table
              columns={modelColumns}
              style={{ minWidth: '900px' }}
              className='wrapper-table'
              enableResizableColumn={false}
              dataSource={vlanPortList}
              expandable={{
                defaultExpandedRowKeys: vlanPortList?.map(vlanPort => vlanPort.id),
                // defaultExpandAllRows: true,
                columnWidth: '24px',
                // expandRowByClick: true,
                // childrenColumnName: 'groupbyModules',
                expandIcon: expandIcon,
                expandedRowRender: (record: GroupedVlanPort) => {
                  const isDefaultModule
                    = record.groupbyModules.find(module => module.isDefaultModule)
                  return <Table
                    className={`groupby-module-table ${isDefaultModule ? 'default-module' : ''}`}
                    enableResizableColumn={false}
                    tableAlertRender={false}
                    type={'tall'}
                    columns={moduleColumns}
                    showHeader={false}
                    stickyHeaders={false}
                    pagination={{
                      defaultPageSize: 10000,
                      showSizeChanger: false,
                      showQuickJumper: false
                    }}
                    dataSource={record.groupbyModules}
                    rowKey='key'
                    rowSelection={{
                      type: 'checkbox',
                      columnWidth: '24px',
                      selectedRowKeys: selectedModuleKeys,
                      onChange: (selectedKeys) => {
                        const orinSelectedModelKeys
                          = selectedModelKeys.filter(key => key !== record?.id)
                        setSelectedModelKeys([
                          ...orinSelectedModelKeys,
                          ...(selectedKeys?.find(key =>
                            (key as string).includes(record?.id)) ? [record?.id] : []
                          )
                        ])
                        setSelectedModuleKeys([
                          ...(selectedKeys as string[])
                        ])
                      }
                    }}
                    expandable={{
                      defaultExpandedRowKeys: record.groupbyModules
                        // .filter((module: VlanPort) => module.isDefaultModule)
                        .map((module: VlanPort) => module.key),
                      // defaultExpandedRowKeys: [vlanPortList?.[0]?.id],
                      // defaultExpandAllRows: true,
                      columnWidth: '65px',
                      // expandRowByClick: true,
                      // childrenColumnName: 'port',
                      // defaultExpandAllRows: true,
                      expandIcon: expandIcon,
                      expandedRowRender: (record) => {
                        return <Table
                          indentSize={40}
                          className='ports-table'
                          enableResizableColumn={false}
                          tableAlertRender={false}
                          columns={portColumns}
                          // showHeader={false}
                          stickyHeaders={false}
                          pagination={{
                            defaultPageSize: 10000,
                            showSizeChanger: false,
                            showQuickJumper: false
                          }}
                          dataSource={record.ports}
                          rowKey='id'
                        />
                      }
                    }}
                  />
                }
              }}
              rowKey='id'
              rowSelection={{
                type: 'checkbox',
                columnWidth: '24px',
                selectedRowKeys: selectedModelKeys,
                onChange: (selectedKeys) => {
                  const updateModuleKeys = _.difference(selectedKeys, selectedModelKeys)
                  const filteredselectedModuleKeys = selectedModuleKeys.filter(key => {
                    return selectedKeys.filter(k => key.includes(k as string))?.length
                  })
                  const updateselectedModuleKeys = vlanPortList
                    .filter(model => updateModuleKeys.includes(model.id))
                    .map(model => model.groupbyModules.map(module => module.key))
                    .flat()

                  if (updateModuleKeys?.length) {
                    setSelectedModuleKeys([
                      ...selectedModuleKeys,
                      ...updateselectedModuleKeys as string[]
                    ])
                  } else {
                    setSelectedModuleKeys(filteredselectedModuleKeys)
                  }
                  setSelectedModelKeys(selectedKeys as string[])

                }
              }}
              rowActions={rowActions}
              actions={filterByAccess([{
                label: $t({ defaultMessage: 'Set Ports' }),
                onClick: () => {
                  setSelectedRow(null as unknown as VlanPort)
                  setModalVisible(true)
                }
              }])}
            />
          </UI.TableWrapper>
          : <Table
            columns={portColumns}
            style={{ minWidth: '900px' }}
            dataSource={[]}
            rowKey='id'
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Set Ports' }),
              onClick: () => {
                setSelectedRow(null as unknown as VlanPort)
                setModalVisible(true)
              }
            }])}
          />
        }
      </Col>
    </Row>

    { modalVisible &&
        <PortsModal
          // vlanId={vlanId}
          open={modalVisible}
          editRecord={selectedRow}
          vlanPortList={vlanPortList}
          // currrentRecords={ruleList}
          onCancel={() => {
            setModalVisible(false)
          }}
          onSave={(values) => {
            const filteredVlanPortList = vlanPortList.filter(vlanPort => {
              const existingModel = selectedRow?.familymodel === vlanPort.id
              return !(existingModel && vlanPort.groupbyModules.length === 1)
            }).reduce((result: GroupedVlanPort[], vlanPort: GroupedVlanPort) => {
              return result.concat({
                ...vlanPort,
                groupbyModules: vlanPort.groupbyModules.filter(module => {
                  return selectedRow?.key !== module.key
                })
              })
            }, [])

            const familymodel = `${values.family}-${values.model}`
            const existingModel
              = filteredVlanPortList.find(list => list.familymodel === familymodel)

            const moduleFixed = checkIfModuleFixed(values.family, values.model)
            const isDefaultModule = moduleFixed?.moduleSelectionEnable === false
            const modulekey = getModuleKey(values.family, values.model, values.slots)

            if (existingModel) {
              const existingModules = existingModel.groupbyModules.find(
                module => module.key === modulekey
              )
              if (existingModules) {
                existingModules.ports = values.portSettings?.reduce((result, port) => {
                  const existingPort = existingModules.ports.find(p => p.port === port.port)
                  if (existingPort) {
                    return [
                      ...result.filter(p => p.port !== port.port),
                      {
                        ...existingPort,
                        untaggedVlan: existingPort?.untaggedVlan.concat(port.untaggedVlan),
                        taggedVlans: existingPort?.taggedVlans.concat(port.taggedVlans)
                      }
                    ]
                  }
                  return [
                    ...result,
                    {
                      id: `${familymodel}-${port?.port}`,
                      port: port?.port,
                      untaggedVlan: port?.untaggedVlan,
                      taggedVlans: port?.taggedVlans
                    }
                  ]
                }, existingModules.ports)
              } else {
                existingModel.groupbyModules.push({
                  key: modulekey,
                  familymodel: familymodel,
                  isDefaultModule,
                  slots: values.slots as Slot[],
                  ports: values.portSettings?.map((port) => ({
                    id: `${familymodel}-${port?.port}`,
                    port: port?.port,
                    untaggedVlan: port?.untaggedVlan,
                    taggedVlans: port?.taggedVlans
                  }))
                })
              }
            } else {
              filteredVlanPortList.push({
                id: familymodel,
                familymodel: familymodel,
                groupbyModules: [{
                  key: modulekey,
                  familymodel: familymodel,
                  isDefaultModule,
                  slots: values.slots as Slot[],
                  ports: values.portSettings?.map((port) => ({
                    id: `${familymodel}-${port?.port}`,
                    port: port?.port,
                    untaggedVlan: port?.untaggedVlan,
                    taggedVlans: port?.taggedVlans
                  }))
                }]
              })
            }

            /* eslint-disable no-console */
            console.log('filteredVlanPortList: ', filteredVlanPortList)
            console.log('vlanPortList: ', vlanPortList)

            setVlanPortList(filteredVlanPortList) ////TODO: update vlan list - switchFamilyModels

            const vlans = form.getFieldValue('vlans') || []
            console.log('vlans: ', vlans)

            /////


            console.log('selectedRow: ', selectedRow)
            console.log('current: ', values)

            const orinVlanMap = selectedRow?.ports?.reduce<VlanMap>((result, row) => {
              row.taggedVlans.concat(row.untaggedVlan).forEach((vlan: string) => {
                if (!result[vlan]) {
                  result[vlan] = {
                    model: selectedRow.familymodel as string,
                    slots: selectedRow.slots,
                    taggedPorts: row.taggedVlans.includes(vlan) ? row.port : '',
                    untaggedPorts: row.untaggedVlan.includes(vlan) ? row.port : ''
                  }
                } else {
                  result[vlan].taggedPorts = row.taggedVlans.includes(vlan)
                    ? `${result[vlan].taggedPorts},${row.port}`.replace(/^,/, '')
                    : result[vlan].taggedPorts

                  result[vlan].untaggedPorts = row.untaggedVlan.includes(vlan)
                    ? `${result[vlan].untaggedPorts},${row.port}`.replace(/^,/, '')
                    : result[vlan].untaggedPorts
                }
              })
              return result
            }, {}) ?? {}

            const newVlanMap = values.portSettings.reduce<VlanMap>((result, row) => {
              row.taggedVlans.concat(row.untaggedVlan).forEach((vlan: string) => {
                if (!result[vlan]) {
                  result[vlan] = {
                    model: `${values.family}-${values.model}`,
                    slots: values.slots,
                    taggedPorts: row.taggedVlans.includes(vlan) ? row.port : '',
                    untaggedPorts: row.untaggedVlan.includes(vlan) ? row.port : ''
                  }
                } else {
                  result[vlan].taggedPorts = row.taggedVlans.includes(vlan)
                    ? `${result[vlan].taggedPorts},${row.port}`.replace(/^,/, '')
                    : result[vlan].taggedPorts

                  result[vlan].untaggedPorts = row.untaggedVlan.includes(vlan)
                    ? `${result[vlan].untaggedPorts},${row.port}`.replace(/^,/, '')
                    : result[vlan].untaggedPorts
                }
              })
              return result
            }, {})

            console.log('orinVlanMap: ', orinVlanMap)
            console.log('newVlanMap: ', newVlanMap)

            const updatedVlans = vlans.map((vlan: SwitchVlans) => {
              const selectedVlan = orinVlanMap[vlan.vlanId]
              const selectedVlanSlots = formatSlotConfigForSaving(selectedVlan?.slots)
              // orinVlanMap[vlan.vlanId]?.slots.map(slot => {
              //   return {
              //     slotNumber: slot.slotNumber,
              //     enable: slot.enable,
              //     ...( slot.slotNumber !== 1 ? { option: slot.option } : {})
              //   }
              // })
              const existingModule = vlan.switchFamilyModels?.find(
                v => _.isEqual(_.sortBy(v.slots, 'slotNumber'), selectedVlanSlots)
              )
              return {
                ...vlan,
                ...(existingModule ? {
                  switchFamilyModels: vlan.switchFamilyModels.map(model => {
                    if (model.id === existingModule.id) {
                      // eslint-disable-next-line max-len
                      const updatedTagged = _.difference(model.taggedPorts?.split(','), selectedVlan.taggedPorts?.split(',')).toString()
                      // eslint-disable-next-line max-len
                      const updatedUntagged = _.difference(model.untaggedPorts?.split(','), selectedVlan.untaggedPorts?.split(',')).toString()
                      if (!updatedTagged && !updatedTagged) {
                        return null
                      }
                      return {
                        ...model,
                        taggedPorts: updatedUntagged,
                        untaggedPorts: updatedUntagged
                      }
                    }
                    return model
                  }).filter(model => model)
                } : {})
              }
            }).map((vlan: SwitchVlans) => {
              const updatedVlan = newVlanMap[vlan.vlanId]
              const updatedVlanSlots = formatSlotConfigForSaving(updatedVlan?.slots)
              const existingModule = vlan.switchFamilyModels?.find(
                v => _.isEqual(_.sortBy(v.slots, 'slotNumber'), updatedVlanSlots)
              )
              return {
                ...( updatedVlan ? _.omit(vlan, 'id') : vlan),
                ...(existingModule ? {
                  switchFamilyModels: vlan.switchFamilyModels.map(model => {
                    if (model.id === existingModule.id) {
                      // eslint-disable-next-line max-len
                      const updatedTagged = model.taggedPorts?.split(',').concat(updatedVlan.taggedPorts?.split(',')).toString()
                      // eslint-disable-next-line max-len
                      const updatedUntagged = model.untaggedPorts?.split(',').concat(updatedVlan.untaggedPorts?.split(',')).toString()
                      if (!updatedTagged && !updatedTagged) {
                        return null
                      }
                      return {
                        ...model,
                        taggedPorts: updatedUntagged,
                        untaggedPorts: updatedUntagged
                      }
                    }
                    return model
                  }).filter(model => model)
                } : ( updatedVlan ? {
                  switchFamilyModels: (vlan.switchFamilyModels ?? []).concat({
                    id: '',
                    model: `${values.family}-${values.model}`,
                    slots: updatedVlanSlots,
                    taggedPorts: updatedVlan?.taggedPorts.toString(),
                    untaggedPorts: updatedVlan?.untaggedPorts.toString()
                  })
                } : {}))
              }
            })

            console.log('** filteredVlans: ', updatedVlans)

            // const vlanMap: Record<number, Record<string, {
            //   slots: Slot[]; taggedPorts: Set<string>; untaggedPorts: Set<string>
            // }>> = {}

            // filteredVlanPortList.forEach(switchData => {
            //   switchData.groupbyModules.forEach(module => {
            //     module.ports?.forEach(port => {
            //       port.untaggedVlan.forEach(vid => {
            //         const vlanId = Number(vid)
            //         if (!vlanMap[vlanId]) {
            //           vlanMap[vlanId] = {}
            //         }
            //         // if (!vlanMap[vlanId][switchData.familymodel].slots) {
            //         //   vlanMap[vlanId] = {};
            //         // }
            //         if (!vlanMap[vlanId][switchData.familymodel]) {
            //           vlanMap[vlanId][switchData.familymodel] = {
            //             slots: module.slots, taggedPorts: new Set(), untaggedPorts: new Set()
            //           }
            //         }
            //         vlanMap[vlanId][switchData.familymodel].untaggedPorts.add(port.port)
            //       })
            //       port.taggedVlans.forEach(vid => {
            //         const vlanId = Number(vid)
            //         if (!vlanMap[vlanId]) {
            //           vlanMap[vlanId] = {}
            //         }
            //         if (!vlanMap[vlanId][switchData.familymodel]) {
            //           vlanMap[vlanId][switchData.familymodel] = {
            //             slots: module.slots, taggedPorts: new Set(), untaggedPorts: new Set()
            //           }
            //         }
            //         vlanMap[vlanId][switchData.familymodel].taggedPorts.add(port.port)
            //       })
            //     })
            //   })
            // })

            // // TODO
            // console.log('****** ',
            //   Object.entries(vlanMap).map(([vlanId, models]) => ({
            //     vlanId: Number(vlanId),
            //     switchFamilyModels: Object.entries(models).map(([model, details]) => ({
            //       model,
            //       slots: details.slots,
            //       taggedPorts: Array.from(details.taggedPorts).join(','),
            //       untaggedPorts: Array.from(details.untaggedPorts).join(',')
            //     }))
            //   }))
            // )
            ////
            form.setFieldValue('vlans', updatedVlans)

            setSelectedModuleKeys([])
            setSelectedModelKeys([])
            setModalVisible(false)
          }}
          vlanList={vlanList}
          // switchFamilyModel={isSwitchLevelVlanEnabled ? switchFamilyModel : undefined}
          // portSlotsData={portSlotsData}
          // portsUsedBy={portsUsedBy}
          // stackMember={stackMember}
        />
    }
    <Form.Item
      name='vlans'
      hidden={true}
      children={<Input />}
    />
  </>)
}
