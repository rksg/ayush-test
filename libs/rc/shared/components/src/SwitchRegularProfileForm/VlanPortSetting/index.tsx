import { useContext, useState, useEffect } from 'react'

import { Row, Col, Form, Input, Space, Typography } from 'antd'
import _                                            from 'lodash'

import { showActionModal, Table, TableProps, StepsForm } from '@acx-ui/components'
import { ArrowExpand, ArrowChevronRight }                from '@acx-ui/icons-new'
import {
  Vlan,
  SWITCH_DEFAULT_VLAN_NAME
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'
import { getIntl }        from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import * as UI                from './styledComponents'
import { PortsModal }         from './VlanPortSetting/PortsModal'
import { checkIfModuleFixed } from './VlanPortSetting/VlanPortSetting.utils'

export interface Slot {
  slotNumber: number
  enable: boolean
  option: string
}

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

          const enableModuleInfo = switchModel.slots
            .filter(slot => slot.slotNumber !== 1)
            .map(slot => {
              return `Module ${slot.slotNumber}: ${slot.option}`
            }).sort()

          const moduleCategory = isDefaultModule ? ['Module: Default'] : enableModuleInfo
          const moduleCategorykey = moduleCategory?.length ?
            `${switchModel.model}_${moduleCategory.toString()}` : `${switchModel.model}_--`

          // console.log('existingModel: ', existingModel)
          // console.log(family, model, switchModel.slots)
          // console.log('moduleInfo: ', enableModuleInfo)

          if (existingModel) {
            const existingModules
              = existingModel.groupbyModules.find(module => module.key === moduleCategorykey)

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
                key: moduleCategorykey,
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
                  key: moduleCategorykey,
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

  const vlansColumns: TableProps<GroupedVlanPort>['columns']= [{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'familymodel',
    key: 'familymodel',
    width: 900,
    defaultSortOrder: 'ascend',
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
    // render: (_, { familymodel,  }) => { // slots, ports
    //   const [family, model] = familymodel?.split('-') ?? []
    //   const moduleInfo = checkIfModuleFixed(family, model)
    //   const moduleString = moduleInfo?.moduleSelectionEnable ? ( ///TODO:check
    //     moduleInfo?.enableSlot3
    //       ? moduleInfo.selectedOptionOfSlot3
    //       : (moduleInfo?.enableSlot2 ? moduleInfo.selectedOptionOfSlot2 : '')
    //   ) : ''

    //   return <Space size={20}>
    //     <span style={{ fontWeight: 'bold' }}>{ `Model: ${familymodel}`}</span>
    //     {/* {moduleString && ` Module ${slots.length}: ${moduleString}`} */}
    //   </Space>
    // }
  // }, {
  //   title: $t({ defaultMessage: 'Untagged VLANs' }),
  //   dataIndex: 'untaggedVlan',
  //   key: 'untaggedVlan'
  // }, {
  //   title: $t({ defaultMessage: 'Tagged VLANs' }),
  //   dataIndex: 'taggedVlan',
  //   key: 'taggedVlan'
  }]

  const vlansColumns2: TableProps<VlanPort>['columns']= [{
    title: $t({ defaultMessage: 'Module' }),
    dataIndex: 'key',
    key: 'key',
    width: 800,
    defaultSortOrder: 'ascend',
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

  const vlansColumns3: TableProps<PortSetting>['columns']= [{
    title: $t({ defaultMessage: 'Port' }),
    dataIndex: 'port',
    key: 'port',
    defaultSortOrder: 'ascend'
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
              columns={vlansColumns}
              style={{ minWidth: '900px' }}
              className='wrapper-table'
              enableResizableColumn={false}
              dataSource={_.sortBy(vlanPortList.map(model => { //TODO
                return {
                  ...model,
                  groupbyModules: _.sortBy([
                    ...model.groupbyModules.map(module => {
                      return {
                        ...module,
                        ports: _.sortBy(module.ports, ['id'])
                      }
                    })
                  ], ['key'])
                }
              }), ['id'])}
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
                    columns={vlansColumns2}
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
                          columns={vlansColumns3}
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
            columns={vlansColumns3}
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

            const moduleFixed = checkIfModuleFixed(values.family, values.model) //TODO
            const isDefaultModule = moduleFixed?.moduleSelectionEnable === false
            const enableModuleInfo = values.slots
              ?.filter(slot => slot.slotNumber !== 1)
              .map(slot => {
                return `Module ${slot.slotNumber}: ${slot.option}`
              }).sort()

            const moduleCategory = isDefaultModule ? ['Module: Default'] : enableModuleInfo
            const moduleCategorykey = moduleCategory?.length ?
              `${familymodel}_${moduleCategory.toString()}` : `${familymodel}_--`

            if (existingModel) {
              const existingModules
              = existingModel.groupbyModules.find(module => module.key === moduleCategorykey)
              if (existingModules) {
                // TODO
                // existingModules.ports.forEach((port) => {
                //   let existingPort = existingModules.ports?.find((p) => p.port === port)
                //   if (existingPort) {
                //     if (untagged.includes(port)) {
                //       existingPort.untaggedVlan.push(item.vlanId?.toString())
                //       existingPort.untaggedVlan
                //         = Array.from(new Set(existingPort.untaggedVlan)).sort()
                //     }
                //     if (tagged.includes(port)) {
                //       existingPort.taggedVlans.push(item.vlanId?.toString())
                //       existingPort.taggedVlans
                //         = Array.from(new Set(existingPort.taggedVlans)).sort()
                //     }
                //   } else {
                //     existingModules.ports?.push({
                //       id: `${switchModel.model}-${port}`,
                //       port,
                //       untaggedVlan: untagged.includes(port) ? [item.vlanId?.toString()] : [],
                //       taggedVlans: tagged.includes(port) ? [item.vlanId?.toString()] : []
                //     })
                //   }
                // })
              } else {
                existingModel.groupbyModules.push({
                  key: moduleCategorykey,
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
                  key: moduleCategorykey,
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
            console.log(vlans)

            /////
            const vlanMap: Record<number, Record<string, {
              slots: Slot[]; taggedPorts: Set<string>; untaggedPorts: Set<string>
            }>> = {}

            filteredVlanPortList.forEach(switchData => {
              switchData.groupbyModules.forEach(module => {
                module.ports?.forEach(port => {
                  port.untaggedVlan.forEach(vid => {
                    const vlanId = Number(vid)
                    if (!vlanMap[vlanId]) {
                      vlanMap[vlanId] = {}
                    }
                    // if (!vlanMap[vlanId][switchData.familymodel].slots) {
                    //   vlanMap[vlanId] = {};
                    // }
                    if (!vlanMap[vlanId][switchData.familymodel]) {
                      vlanMap[vlanId][switchData.familymodel] = {
                        slots: module.slots, taggedPorts: new Set(), untaggedPorts: new Set()
                      }
                    }
                    vlanMap[vlanId][switchData.familymodel].untaggedPorts.add(port.port)
                  })
                  port.taggedVlans.forEach(vid => {
                    const vlanId = Number(vid)
                    if (!vlanMap[vlanId]) {
                      vlanMap[vlanId] = {}
                    }
                    if (!vlanMap[vlanId][switchData.familymodel]) {
                      vlanMap[vlanId][switchData.familymodel] = {
                        slots: module.slots, taggedPorts: new Set(), untaggedPorts: new Set()
                      }
                    }
                    vlanMap[vlanId][switchData.familymodel].taggedPorts.add(port.port)
                  })
                })
              })
            })

            // TODO
            console.log(
              Object.entries(vlanMap).map(([vlanId, models]) => ({
                vlanId: Number(vlanId),
                switchFamilyModels: Object.entries(models).map(([model, details]) => ({
                  model,
                  slots: details.slots,
                  taggedPorts: Array.from(details.taggedPorts).join(','),
                  untaggedPorts: Array.from(details.untaggedPorts).join(',')
                }))
              }))
            )
            ////

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
