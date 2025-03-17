import { useContext, useState, useEffect, Key } from 'react'

import { Row, Col, Form, Input, Space, Typography } from 'antd'
import _                                            from 'lodash'

import { showActionModal, Table, TableProps, StepsForm } from '@acx-ui/components'
import { ArrowExpand, ArrowChevronRight }                from '@acx-ui/icons-new'
import {
  defaultSort,
  sortProp,
  SWITCH_DEFAULT_VLAN_NAME,
  Vlan,
  getFamilyAndModel
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'
import { getIntl }        from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import {
  checkIfModuleFixed,
  getModuleKey,
  getSelectedRows,
  getUpdatedVlans,
  getUpdatedVlanPortList,
  ModuleGroupByModel,
  Slot,
  PortSetting,
  PortsModalSetting,
  ModulePorts,
  VlanPortMessages
} from './index.utils'
import { PortsModal } from './PortsModal'
import * as UI        from './styledComponents'

export function VlanPortSetting () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData, editMode } = useContext(ConfigurationProfileFormContext)
  const [ vlanList, setVlanList ] = useState<Vlan[]>([])
  const [ vlanPortList, setVlanPortList ] = useState<ModuleGroupByModel[]>([])
  const [ modalVisible, setModalVisible ] = useState(false)
  const [ selectedRow, setSelectedRow ] = useState<ModulePorts>(null as unknown as ModulePorts)

  const [ selectedRowKeys, setSelectedRowKeys ] = useState([] as string[]) // display the count of selected items
  const [ selectedModelKeys, setSelectedModelKeys ] = useState([] as string[])
  const [ selectedModuleKeys, setSelectedModuleKeys ] = useState([] as string[])

  useEffect(() => {
    if (currentData?.vlans) {
      form.setFieldsValue(currentData)
      const vlanList = currentData.vlans.filter(
        item => item.vlanName !== SWITCH_DEFAULT_VLAN_NAME
      )
      const vlanPortList = transformData(currentData.vlans)

      setVlanList(vlanList)
      setVlanPortList(vlanPortList)
    }
  }, [currentData, editMode])

  useEffect(() => {
    const filteredModuleKeys = selectedModuleKeys.filter(key => {
      const model = key.split('_')[0]
      return !selectedModelKeys.includes(model)
    })
    const truncatedModuleKeys = selectedModelKeys.map(key => {
      const current = vlanPortList.find(record => record.id === key)
      return current ? current.groupbyModules.map(module => module.key).slice(0, -1) : []
    }).flat() ?? []

    setSelectedRowKeys(_.uniq([
      ...selectedModelKeys,
      ...filteredModuleKeys,
      ...truncatedModuleKeys // remove last one
    ]))

  }, [selectedModelKeys])

  const modelColumns: TableProps<ModuleGroupByModel>['columns']= [{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'familymodel',
    key: 'familymodel',
    width: 900,
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('familymodel', defaultSort) },
    render: (_, data: ModuleGroupByModel) => {
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

  const moduleColumns: TableProps<ModulePorts>['columns']= [{
    title: $t({ defaultMessage: 'Module' }),
    dataIndex: 'key',
    key: 'key',
    width: 800,
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('key', defaultSort) },
    render: (_, data: ModulePorts) => {
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
    sorter: { compare: ({ port: a }, { port: b }) => {
      if (a.split('/')[2] && b.split('/')[2]) {
        const slotDiff = Number(a.split('/')[1]) - Number(b.split('/')[1])
        if (slotDiff !== 0) {
          return slotDiff
        }
        return Number(a.split('/')[2]) - Number(b.split('/')[2])
      }
      return 1
    } }
  }, {
    title: $t({ defaultMessage: 'Untagged VLAN' }),
    dataIndex: 'untaggedVlan',
    key: 'untaggedVlan'
  }, {
    title: $t({ defaultMessage: 'Tagged VLANs' }),
    dataIndex: 'taggedVlans',
    key: 'taggedVlans',
    render: (_, data: PortSetting) => {
      return data.taggedVlans.sort((a, b) => Number(a) - Number(b)).join(', ')
    }
  }]

  const rowActions: TableProps<ModuleGroupByModel>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    disabled: () => selectedModuleKeys.length > 1,
    tooltip: selectedModuleKeys.length > 1 ? $t(VlanPortMessages.CANNOT_BE_EDITED) : '',
    onClick: () => {
      const model = selectedModuleKeys[0].split('_')[0]
      const selectedModel
        = vlanPortList.find(vlanPort => vlanPort.id === model)
      const selectedRow = selectedModel?.groupbyModules.find(
        module => module.key === selectedModuleKeys?.[0]
      )

      setSelectedRow(selectedRow as ModulePorts)
      setModalVisible(true)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows, clearSelection) => {
      const isSelectedOneModule = selectedModuleKeys.length === 1
      const shouldShowOnboardWarning = editMode && currentData.applyOnboardOnly

      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Delete Selected Module(s)?' }),
        ...( shouldShowOnboardWarning
          ? { content: $t(VlanPortMessages.DELETE_MODULE_WHEM_APPLY_ONBOARD_ENABLED) } : {}
        ),
        customContent: {
          action: 'DELETE',
          entityName: isSelectedOneModule
            ? $t({ defaultMessage: 'Module' })
            : $t({ defaultMessage: 'Modules' }),
          entityValue: isSelectedOneModule ? selectedModuleKeys[0].replace('_', ' ') : undefined,
          numOfEntities: selectedModuleKeys.length
        },
        onOk: () => {
          const vlans = form.getFieldValue('vlans') || []
          const selectedRows = getSelectedRows(selectedModuleKeys, vlanPortList)

          const filteredVlanPortList = getUpdatedVlanPortList(vlanPortList, selectedModuleKeys)
          const updatedVlans = getUpdatedVlans(selectedRows, vlans)

          setVlanPortList(filteredVlanPortList as ModuleGroupByModel[])
          form.setFieldValue('vlans', updatedVlans)
          clearSelection()
        }
      })
    }
  }]

  const expandIcon = <T,>({ expanded, onExpand, record }: {
    expanded: boolean,
    onExpand: (data: T, e: React.MouseEvent<HTMLElement>) => void,
    record: T
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

  const handleChangeModel = (selectedKeys: Key[]) => {
    const modelKeys = selectedKeys.filter(key => !key.toString().includes('_'))
    const hasSelectAllModel = modelKeys.length === vlanPortList.length
    const updateModelKeys
      = hasSelectAllModel ? modelKeys : _.difference(modelKeys, selectedModelKeys)

    const filteredselectedModuleKeys = selectedModuleKeys.filter(key => {
      const model = key.split('_')[0]
      return selectedKeys.filter(
        k => key.includes(k as string))?.length && modelKeys.includes(model)
    })

    const updateSelectedModuleKeys = vlanPortList
      .filter(model => updateModelKeys.includes(model.id))
      .map(model => model.groupbyModules.map(module => module.key))
      .flat()

    if (updateModelKeys?.length) {
      setSelectedModuleKeys(_.uniq([
        ...selectedModuleKeys,
        ...updateSelectedModuleKeys as string[]
      ]))
    } else {
      setSelectedModuleKeys(filteredselectedModuleKeys)
    }
    setSelectedModelKeys(modelKeys as string[])
  }

  const handleChangeModule = (record: ModuleGroupByModel, selectedKeys: Key[]) => {
    const currentModuleKeys = record.groupbyModules.map(m => m.key)
    const currentSelectedModules = _.intersection(currentModuleKeys, selectedKeys)
    const hasSelectedAllModules = currentSelectedModules.length === currentModuleKeys.length
    const orinSelectedModelKeys = selectedModelKeys.filter(key => key !== record?.id)

    setSelectedModuleKeys([
      ...(selectedKeys as string[])
    ])
    setSelectedModelKeys([
      ...orinSelectedModelKeys,
      ...(hasSelectedAllModules && selectedKeys?.find(key =>
        (key as string).includes(record?.id)) ? [record?.id] : []
      )
    ])
  }

  const handleClickSetPorts = () => {
    setSelectedRow(null as unknown as ModulePorts)
    setSelectedModuleKeys([])
    setSelectedModelKeys([])
    setModalVisible(true)
  }

  const handleSavePorts = (values: PortsModalSetting) => {
    const vlans = form.getFieldValue('vlans') || []
    const moduleKeys = selectedModuleKeys?.length
      ? selectedModuleKeys : [getModuleKey(values.family, values.model, values.slots)]

    const selectedRows = selectedRow ? [selectedRow] : getSelectedRows(moduleKeys, vlanPortList)
    const filteredVlanPortList = getUpdatedVlanPortList(vlanPortList, moduleKeys, values)
    const updatedVlans = getUpdatedVlans(selectedRows, vlans, values)

    form.setFieldValue('vlans', updatedVlans)
    setVlanPortList(filteredVlanPortList)
    setSelectedModuleKeys([])
    setSelectedModelKeys([])
    setModalVisible(false)
  }

  return (<>
    <Row gutter={20}>
      <Col span={20}>
        <StepsForm.Title children={$t({ defaultMessage: 'Ports' })} />
        { vlanPortList?.length
          ? <UI.TableWrapper>
            <Table
              columns={modelColumns}
              className='wrapper-table'
              enableResizableColumn={false}
              dataSource={vlanPortList}
              expandable={{
                defaultExpandedRowKeys: vlanPortList?.map(vlanPort => vlanPort.id),
                columnWidth: '24px',
                expandIcon: expandIcon,
                expandedRowRender: (record: ModuleGroupByModel) => {
                  const isDefaultModule
                    = record.groupbyModules.find(module => module.isDefaultModule)
                  const defaultExpandedRowKeys
                    = record.groupbyModules.map((module: ModulePorts) => module.key)
                  return <Table
                    className={`groupby-module-table ${isDefaultModule ? 'default-module' : ''}`}
                    enableResizableColumn={false}
                    tableAlertRender={false}
                    type='tall'
                    columns={moduleColumns}
                    showHeader={false}
                    stickyHeaders={false}
                    pagination={{
                      defaultPageSize: 10000,
                      showSizeChanger: false
                    }}
                    dataSource={record.groupbyModules}
                    rowKey='key'
                    rowSelection={{
                      type: 'checkbox',
                      columnWidth: '24px',
                      selectedRowKeys: selectedModuleKeys,
                      onChange: (selectedKeys) => handleChangeModule(record, selectedKeys)
                    }}
                    expandable={{
                      defaultExpandedRowKeys: defaultExpandedRowKeys,
                      columnWidth: '65px',
                      expandIcon: expandIcon,
                      expandedRowRender: (record) => {
                        return <Table
                          className='ports-table'
                          enableResizableColumn={false}
                          tableAlertRender={false}
                          columns={portColumns}
                          stickyHeaders={false}
                          pagination={{
                            defaultPageSize: 10000,
                            showSizeChanger: false
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
                selectedRowKeys: selectedRowKeys,
                onChange: handleChangeModel,
                getCheckboxProps: (record) => {
                  const moduleKeys = record.groupbyModules.map(m => m.key)
                  const currentSelectedModules = _.intersection(moduleKeys, selectedModuleKeys)
                  const hasSelectedAllModules = currentSelectedModules.length === moduleKeys.length

                  if (currentSelectedModules?.length === 0) {
                    return { disabled: false }
                  }
                  return { indeterminate: !hasSelectedAllModules, disabled: false }
                }
              }}
              rowActions={rowActions}
              actions={filterByAccess([{
                label: $t({ defaultMessage: 'Set Ports' }),
                disabled: vlanList.length === 0,
                onClick: handleClickSetPorts
              }])}
            />
          </UI.TableWrapper>
          : <Table
            columns={portColumns}
            dataSource={[]}
            rowKey='id'
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Set Ports' }),
              disabled: vlanList.length === 0,
              tooltip: vlanList.length === 0 ? $t(VlanPortMessages.NO_AVAILABLE_VLANS) : '',
              onClick: handleClickSetPorts
            }])}
          />
        }
      </Col>
    </Row>

    { modalVisible &&
        <PortsModal
          open={modalVisible}
          editRecord={selectedRow}
          vlanPortList={vlanPortList}
          onCancel={() => {
            setModalVisible(false)
          }}
          onSave={handleSavePorts}
          vlanList={vlanList}
        />
    }

    <Form.Item
      name='vlans'
      hidden={true}
      children={<Input />}
    />

  </>)
}

function transformData (vlans: Vlan[]) {
  return vlans.reduce((result: ModuleGroupByModel[], item: Vlan) => {
    if (!item.switchFamilyModels) return result

    item.switchFamilyModels.forEach((switchModel) => {
      const [ family, model ] = getFamilyAndModel(switchModel.model)
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
}