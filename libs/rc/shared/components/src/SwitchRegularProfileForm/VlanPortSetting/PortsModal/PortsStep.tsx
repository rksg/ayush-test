import React, { useState, useEffect } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import { Row, Col, Form, Typography, Checkbox, Input, Divider, Space } from 'antd'
import { DefaultOptionType }                                           from 'antd/lib/select'
import _, { isArray }                                                  from 'lodash'

import {
  Button,
  Select,
  Subtitle,
  Tooltip
} from '@acx-ui/components'
import {
  getSwitchPortLabel,
  PortStatusMessages,
  Vlan
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import {
  shouldRenderMultipleText,
  MultipleText
} from '../../../SwitchPortTable/editPortDrawer.utils'
import {
  getModuleKey,
  ModuleGroupByModel,
  ModulePorts,
  PortSetting,
  PortsType,
  VlanPortMessages
} from '../index.utils'

import {
  getUnit,
  getModule,
  getAllVlansFromPortList,
  selectedGroupByPrefix,
  PortSettings
} from './PortsModal.utils'
import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

type VlanType = 'untaggedVlan' | 'taggedVlans'

enum VlanTypes {
  UNTAGGED = 'untaggedVlan',
  TAGGED = 'taggedVlans'
}

export function PortsStep (props:{
  editRecord?: ModulePorts
  vlanList: Vlan[],
  modelPorts?: ModuleGroupByModel
  moduleData?: PortsType[][][]
}) {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { editRecord, vlanList, modelPorts, moduleData } = props

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [vlanOptions, setVlanOptions] = useState([] as DefaultOptionType[])

  const [hasMultipleValue, setHasMultipleValue] = useState([] as string[])
  const [previousHasMultipleValue, setPreviousHasMultipleValue] = useState([] as string[])

  // cross module data
  const [initialModelPortList, setInitialModelPortList] = useState({} as PortSettings)
  // current module data
  const [initialModulePortList, setInitialModulePortList] = useState({} as PortSettings)

  // module port list before VLAN editing begins, used for reverting changes if needed
  const [previousModulePortList, setPreviousModulePortList] = useState({} as PortSettings)
  // module port list reflecting the latest user modifications, updated after VLAN changes
  const [editedModulePortList, setEditedModulePortList] = useState({} as PortSettings)

  const { family, model, slots } = form.getFieldsValue(true)
  const familymodel = `${family}-${model}`

  const selectedModuleInfo = Array.from({ length: 3 }, (_, index) => {
    const slotNumber = index + 1
    const slot = slots.find((slot: { slotNumber: number }) => slot.slotNumber === slotNumber)
    return slot?.slotPortInfo?.split('X').join(' X ') || ''
  })

  const isMultipleEdit = selectedItems.length > 1
  const configuredFields = ['taggedVlans', 'untaggedVlan']

  // eslint-disable-next-line max-len
  const [ untaggedVlan, taggedVlans, portSettings, untaggedVlanCheckbox, taggedVlansCheckbox ] = [
    Form.useWatch('untaggedVlan', form),
    Form.useWatch('taggedVlans', form),
    Form.useWatch<PortSetting[]>('portSettings', form),
    Form.useWatch('untaggedVlanCheckbox', form),
    Form.useWatch('taggedVlansCheckbox', form)
  ]

  const getModelPortList = (
    modulekey: string,
    data?: ModuleGroupByModel,
    isFiltered: boolean = false
  ) => {
    return data?.groupbyModules
      ? data.groupbyModules
        .filter(module => {
          return !isFiltered || (
            editRecord ? module.key === editRecord?.key : module.key === modulekey
          )
        }).reduce((result, module) => {
          return {
            ...result,
            ...module.ports.reduce((acc, portData) => {
              const { port, untaggedVlan = [], taggedVlans = [] } = portData
              const portIndex = port as keyof typeof result
              if (result[portIndex]) {
                return {
                  ...acc,
                  [port]: {
                    untaggedVlan: result[portIndex].untaggedVlan.concat(untaggedVlan),
                    taggedVlans: result[portIndex].taggedVlans.concat(taggedVlans)
                  }
                }
              }
              return {
                ...acc,
                [port]: {
                  untaggedVlan,
                  taggedVlans
                }
              }
            }, {})
          }
        }, {} as PortSettings)
      : {}
  }

  const getUntaggedSelectorDisabled = (selectedItems: string[]) => {
    if (!selectedItems?.length) return false

    const getUntaggedVlans = (source: PortSettings) =>
      selectedItems.flatMap(port => source[port]?.untaggedVlan ?? [])

    const modelUntaggedVlans = getUntaggedVlans(initialModelPortList)
    const moduleUntaggedVlans = getUntaggedVlans(editedModulePortList)
    const originalModuleUntaggedVlans = getUntaggedVlans(initialModulePortList)

    return _.difference(modelUntaggedVlans, [
      ...moduleUntaggedVlans, ...originalModuleUntaggedVlans
    ]).length > 0
  }

  const getVlanOptionDisabled = (
    value: string, type: VlanType
  ) => {
    const portSettings: PortSetting[] = form.getFieldValue('portSettings')
    const checkField = type === VlanTypes.UNTAGGED ? VlanTypes.TAGGED : VlanTypes.UNTAGGED

    const currentModelVlans = getAllVlansFromPortList(initialModelPortList)
    const oringinalModuleVlans = getAllVlansFromPortList(initialModulePortList)
    const unavailableVlans = _.difference(currentModelVlans, oringinalModuleVlans)

    const assignedVlans = portSettings.filter(port =>
      selectedItems.includes(port.port)
    ).map(port => port[checkField]).flat()

    const hasAssigned = assignedVlans?.includes(value)
    const isUnavailableVlans = unavailableVlans.includes(value)

    return {
      disabled: hasAssigned || isUnavailableVlans,
      hasAssigned,
      isUnavailableVlans
    }
  }

  const getVlanOptions = (type: VlanType) => {
    const isUntaggedType = type === VlanTypes.UNTAGGED
    return vlanOptions.map(opt => {
      const value = opt.value as string
      const { disabled, hasAssigned, isUnavailableVlans } = getVlanOptionDisabled(value, type)
      const tooltipTitle = isUnavailableVlans
        ? $t(VlanPortMessages.VLAN_HAS_BEEN_CONFIGURED_IN_MODEL)
        : (hasAssigned
          ? (isUntaggedType
            ? $t(VlanPortMessages.CANNOT_BE_SAME_AS_TAGGED)
            : $t(VlanPortMessages.CANNOT_BE_SAME_AS_UNTAGGED))
          : ''
        )

      return <Select.Option
        value={opt.value}
        key={`${type}_${opt.value}`}
        disabled={disabled}
        children={disabled
          ? <Tooltip placement='topLeft' title={tooltipTitle}>
            <div>{ opt.label }</div>
          </Tooltip>
          : <>{opt.label}</>
        }
      />
    })
  }

  useEffect(() => {
    const portSettings: PortSetting[] = form.getFieldValue('portSettings')
    const vlanOptions = vlanList.map((item) => ({
      label: item.vlanId,
      value: item.vlanId?.toString()
    })).sort((a, b) => Number(a.value) - Number(b.value))

    const modulekey = getModuleKey(family, model, slots)
    const portSettingKeys = portSettings.map(({ port }) => port)
    const initialModelPortList = getModelPortList(modulekey, modelPorts)
    const editedModulePortList = getModelPortList(modulekey, modelPorts, true)

    const currentSettings: PortSettings = {
      ..._.omitBy(editedModulePortList, (_, key) => portSettingKeys.includes(key)),
      ...Object.fromEntries(
        portSettings.map(({ port, untaggedVlan, taggedVlans }) =>
          [port, { untaggedVlan, taggedVlans }]
        )
      )
    }

    if (Object.keys(currentSettings).length && !portSettings?.length) {
      const updatedPortSettings = Object.entries(currentSettings)
        .map(([port, { untaggedVlan, taggedVlans }]) => ({
          id: `${family}-${model}-${port}`,
          port, untaggedVlan, taggedVlans
        }))

      form.setFieldValue('portSettings', updatedPortSettings)
    }

    setVlanOptions(vlanOptions as DefaultOptionType[])
    setInitialModelPortList(initialModelPortList as PortSettings)
    setInitialModulePortList(editedModulePortList as PortSettings)
    setPreviousModulePortList(currentSettings)
    setEditedModulePortList(currentSettings)
    resetOverrideCheckbox()
  }, [])

  useEffect(() => {
    const portSettings = form.getFieldValue('portSettings')
    const selectPort = portSettings?.filter(
      (p: { port: string }) => selectedItems.includes(p.port))?.[0]
    const hasDefaultValue = (field: string) => {
      return selectedItems?.length === 1 || !hasMultipleValue.includes(field)
    }

    form.setFieldsValue({
      untaggedVlan: hasDefaultValue('untaggedVlan') ? selectPort?.untaggedVlan : [],
      taggedVlans: hasDefaultValue('taggedVlans') ? selectPort?.taggedVlans : []
    })
  }, [selectedItems])

  let tmpSelectedItem: string[] = []
  const { DragSelection: DragSelectionPorts } = useSelectionContainer({
    eventsElement: document.getElementById('portsContainer'),
    shouldStartSelecting: (target) => {
      if (target instanceof HTMLElement) {
        let el = target
        while (el.parentElement && !el.dataset.disableselect) {
          el = el.parentElement
        }
        return el.dataset.disableselect !== 'true'
      }
      return true
    },
    onSelectionChange: (box) => {
      tmpSelectedItem = []
      const scrollAwareBox: Box = {
        ...box,
        top: box.top,
        left: box.left
      }

      Array.from({ length: moduleData?.length || 0 }).forEach((_, index) => {
        const ports = moduleData?.[index].flat()
        ports?.forEach((port) => {
          const [unit, slot, portNumber] = port.value?.toString().split('/') ?? ''
          const itemKey = `module${unit}_${slot}_${portNumber}`
          const item = document.getElementById(itemKey)
          if(item){
            const { left, top, width, height } = item.getBoundingClientRect()
            const boxItem = { left, top, width, height }
            if (boxesIntersect(scrollAwareBox, boxItem)) {
              if(item.dataset.value !== undefined && item.dataset.disabled === 'false'){
                tmpSelectedItem.push(item.dataset.value)
              }
            }
          }
        })
      })

      tmpSelectedItem = _.uniq(tmpSelectedItem)
    },
    onSelectionEnd: () => {
      const selectedVlanPort = selectedItems
      const selected = _.xor(selectedVlanPort, tmpSelectedItem)

      if (tmpSelectedItem) {
        handleSelectedItemsChange(selected)
      }

      tmpSelectedItem = []
    },
    isEnabled: true
  })

  const handleCheckboxGroupChange = (checkedValues: string[], moduleGroup: string) => {
    const selectedPorts = selectedItems
    const selectedPortsGroupByPrefix = selectedGroupByPrefix(selectedPorts)

    const selected = _.uniq([
      ...Object.values(_.omit(selectedPortsGroupByPrefix, moduleGroup)).flat(),
      ...checkedValues
    ])

    handleSelectedItemsChange(selected)
  }

  const handleOverrideCheckboxChange = (
    e: CheckboxChangeEvent, field: 'untaggedVlan' | 'taggedVlans'
  ) => {
    const checkboxChecked = e.target.checked
    const untaggedCheckboxChanged = field === 'untaggedVlan'
    const getPreviousVlans = (vlanType: 'untaggedVlan' | 'taggedVlans', currentPort?: string) =>
      selectedItems?.flatMap((port) => {
        const previousVlans = previousModulePortList[port]?.[vlanType] ?? []
        return port === currentPort ? [] : previousVlans
      })

    const updatePortSettings = selectedItems.map((port) => {
      const previousUntagged = previousModulePortList[port]?.untaggedVlan ?? []
      const previousTagged = previousModulePortList[port]?.taggedVlans ?? []
      const currentUntagged = editedModulePortList[port]?.untaggedVlan ?? []
      const currentTagged = editedModulePortList[port]?.taggedVlans ?? []

      let updatedUntaggedVlan = currentUntagged
      let updatedTaggedVlan = currentTagged

      if (checkboxChecked) {
        const hasMultipleValue = previousHasMultipleValue.includes(field)
        if (untaggedCheckboxChanged) {
          updatedUntaggedVlan = !hasMultipleValue ? currentUntagged : []
        } else if (!untaggedCheckboxChanged) {
          updatedTaggedVlan = !hasMultipleValue ? currentTagged : []
        }
      } else {
        const hasMultipleValue = previousHasMultipleValue.includes(field)
        const shouldRemoveVlans = getPreviousVlans(field, hasMultipleValue ? '' : port)
        if (untaggedCheckboxChanged) {
          updatedUntaggedVlan = previousUntagged
          // eslint-disable-next-line max-len
          updatedTaggedVlan = taggedVlansCheckbox ? _.difference(currentTagged, shouldRemoveVlans) : previousTagged
        } else if (!untaggedCheckboxChanged) {
          // eslint-disable-next-line max-len
          updatedUntaggedVlan = untaggedVlanCheckbox ? _.difference(currentUntagged, shouldRemoveVlans) : previousUntagged
          updatedTaggedVlan = previousTagged
        }
      }

      return {
        id: `${familymodel}-${port}`,
        port,
        untaggedVlan: updatedUntaggedVlan,
        taggedVlans: updatedTaggedVlan
      }
    })

    if (!checkboxChecked) {
      // should remove invlaid vlans from current vlans
      const untaggedVlanArray
        = untaggedVlan ? (isArray(untaggedVlan) ? untaggedVlan : [untaggedVlan]) : []
      const previousVlans = getPreviousVlans(field)
      const diffVlans = _.difference(
        untaggedCheckboxChanged ? taggedVlans : untaggedVlanArray, previousVlans
      )

      form.setFieldValue(
        untaggedCheckboxChanged ? 'taggedVlans' : 'untaggedVlan',
        untaggedCheckboxChanged ? diffVlans : (diffVlans?.length ? diffVlans.toString() : null)
      )

      form.setFieldValue(
        field,
        previousHasMultipleValue.includes(field) ? [] : _.uniq(previousVlans)
      )

    } else {
      const previousVlans = getPreviousVlans(field)
      form.setFieldValue(
        field,
        previousHasMultipleValue.includes(field)
          ? ( untaggedCheckboxChanged ? null : [] )
          : _.uniq(previousVlans)
      )
    }

    updateValues(updatePortSettings)

  }

  const getPortInfoTooltip = (port: string) => {
    const { $t } = getIntl()
    const { untaggedVlan = [], taggedVlans = [] } = editedModulePortList[port] ?? {}

    return <div>
      <UI.TooltipTitle>{
        $t(PortStatusMessages.CURRENT)
      }</UI.TooltipTitle>
      <div>
        <UI.TagsTitle>
          <UI.TagsOutlineIcon />{ $t({ defaultMessage: 'Untagged' }) }
        </UI.TagsTitle>
        <UI.PortSpan>{ untaggedVlan.join(', ') || '-' }</UI.PortSpan></div>
      <div>
        <UI.TagsTitle>
          <UI.TagsSolidIcon />{ $t({ defaultMessage: 'Tagged' }) }
        </UI.TagsTitle>
        <UI.PortSpan>{ taggedVlans.join(', ') || '-' }</UI.PortSpan>
      </div>
    </div>
  }

  const getPortLabel = (port: number, slot: number) => {
    const portLabel = getSwitchPortLabel(familymodel, slot) + port.toString()
    return portLabel
  }

  const getFormattedModuleOptions = (
    modulePorts: PortsType[], unit: number, moduleIndex: number
  ) => {
    return modulePorts?.map((port, i) => ({
      label: <Tooltip
        title={getPortInfoTooltip(port.value)}
      >
        <div
          id={`module${unit}_${moduleIndex}_${i+1}`}
          data-value={port.value}
          data-testid={`module${unit}_${moduleIndex}_${i+1}`}
          data-disabled={false}
          style={{ width: '20px', height: '20px' }}
        >
        </div>
        <p>{getPortLabel(i+1, moduleIndex)}</p>
      </Tooltip>,
      value: port.value,
      disabled: false
    }))
  }

  const getPortsView = (moduleData: PortsType[][][]) => {
    return moduleData.map((module, index) => {
      const unit = getUnit(module)
      const module2 = getModule(module, '2', unit)
      const module3 = getModule(module, '3', unit)

      const moduleOptions = [
        module?.[0], module2, module3
      ]
      const formattedModuleOptions = moduleOptions.map(
        (options, index) => getFormattedModuleOptions(options, unit, index + 1)
      )

      return <React.Fragment key={`module${index}`}>
        <UI.CardStyle key={`card${index}`}>
          <Row gutter={20} className='content'>
            { moduleOptions.map((module, i) => {
              const index = i+1
              return module && <Col key={`module${unit}_${index}`}>
                <Row gutter={20}>
                  <Col>
                    <div>
                      <Typography.Text style={{ fontWeight: 'bold' }}>
                        { $t({ defaultMessage: 'Module {index}' }, { index }) }
                      </Typography.Text>
                    </div>
                    <Typography.Paragraph>{
                      $t({ defaultMessage: '{moduleInfo}' }, {
                        moduleInfo: selectedModuleInfo[i]
                      })
                    }</Typography.Paragraph>
                    <UI.Module>
                      <Checkbox.Group
                        key={`checkboxGroup_module${unit}_${index}`}
                        className='lightblue'
                        onChange={(checkedValues) => {
                          handleCheckboxGroupChange(checkedValues as string[], `${unit}/${index}`)
                        }}
                        value={selectedItems}
                        options={formattedModuleOptions[i]}
                      />
                    </UI.Module>
                  </Col>
                </Row>
              </Col>
            }) }
          </Row>
        </UI.CardStyle>
        <Button
          type='link'
          size='small'
          disabled={!selectedItems?.length}
          style={{ float: 'right', marginBottom: '20px' }}
          onClick={() => {
            handleSelectedItemsChange([])
          }}>
          {$t({ defaultMessage: 'Clear Selection' })}
        </Button>
      </React.Fragment>
    })
  }

  const handleSelectedItemsChange = (selected: string[]) => {
    const hasMultipleValueFields = getMultipleValueStates(selected, portSettings)
    setSelectedItems(selected)
    setHasMultipleValue(hasMultipleValueFields)
    setPreviousHasMultipleValue(hasMultipleValueFields)
    setPreviousModulePortList(editedModulePortList as PortSettings)
    resetOverrideCheckbox()
  }

  const handleVlansChange = () => {
    const { untaggedVlan = [], taggedVlans = [] } = form.getFieldsValue()
    const overrideUntaggedVlan = selectedItems.length === 1 || untaggedVlanCheckbox
    const overrideTaggedVlans = selectedItems.length === 1 || taggedVlansCheckbox

    const updatePortSettings = selectedItems?.map((port) => {
      return {
        id: `${familymodel}-${port}`,
        port,
        untaggedVlan: overrideUntaggedVlan
          ? Array.isArray(untaggedVlan) ? untaggedVlan : [untaggedVlan] as string[]
          : (editedModulePortList[port]?.untaggedVlan ?? []),
        taggedVlans: overrideTaggedVlans
          ? (taggedVlans as string[]) : (editedModulePortList[port]?.taggedVlans ?? [])
      }
    })

    updateValues(updatePortSettings)
  }

  const updateValues = (updatePortSettings: PortSetting[]) => {
    // update data to editedModulePortList and portSettings
    const updatedPortSettings = [
      ...portSettings.filter((p: { port: string }) => !selectedItems.includes(p.port)),
      ...updatePortSettings
    ]
    const hasMultipleValueFields = getMultipleValueStates(selectedItems, updatedPortSettings)

    setHasMultipleValue(hasMultipleValueFields)
    setEditedModulePortList({
      ..._.omitBy(editedModulePortList, (_, key) => selectedItems.includes(key)),
      ...Object.fromEntries(updatePortSettings.map(({ port, untaggedVlan, taggedVlans }) =>
        [ port, { untaggedVlan, taggedVlans } ]
      ))
    })

    form.setFieldValue('portSettings', updatedPortSettings)
  }

  const resetOverrideCheckbox = () => {
    const checkboxChecked = Object.entries(form.getFieldsValue(true))
      .filter(([field, value]) => value && field.includes('Checkbox'))
      .map(([field]) => field)

    const resetList = checkboxChecked.reduce((obj, c) => ({ ...obj, [c]: false }), {})
    form.setFieldsValue(resetList)
  }

  const getMultipleValueStates = (selected: string[], portSettings: PortSetting[] = []) => {
    const selectedPortSetting = selected.map(port => {
      const settings = portSettings.find(p => port === p.port)
      return settings ? settings : { taggedVlans: [], untaggedVlan: [] }
    }) as PortSetting[]

    return configuredFields?.filter(field => {
      const itemField = field as keyof PortSetting
      const baseSetting = (selectedPortSetting[0]?.[itemField] as string[])?.sort()
      const isEqual = selectedPortSetting.every(
        port => _.isEqual((port[itemField] as string[])?.sort(), baseSetting)
      )
      return !isEqual
    })
  }

  const getFieldDisabled = (field: string) => {
    const checkboxEnabled = form?.getFieldValue(`${field}Checkbox`)
    switch (field) {
      default:
        return isMultipleEdit && !checkboxEnabled
    }
  }

  const getFieldDisabledTooltip = (field: string) => {
    switch (field) {
      case 'untaggedVlan':
        return getUntaggedSelectorDisabled(selectedItems)
          ? $t(VlanPortMessages.PORT_HAS_BEEN_CONFIGURED_UNTAGGED)
          : ''
      default:
        return ''
    }
  }

  const getOverrideDisabled = (field: string) => {
    switch (field) {
      case 'untaggedVlan':
        return getUntaggedSelectorDisabled(selectedItems)
      default:
        return false
    }
  }

  const getOverrideDisabledTooltip = (field: string) => {
    switch (field) {
      case 'untaggedVlan':
        return $t(VlanPortMessages.PORT_HAS_BEEN_CONFIGURED_UNTAGGED)
      default:
        return ''
    }
  }

  const getFieldTemplate = (props: {
      content: React.ReactNode,
      field: 'untaggedVlan' | 'taggedVlans',
      extraLabel?: boolean
    }) => {
    const { content, field } = props
    const isOverrideDisabled = getOverrideDisabled(field)
    return <UI.FormItem>
      { isMultipleEdit &&
      <Tooltip title={isOverrideDisabled ? getOverrideDisabledTooltip(field) : ''}>
        <Space style={{ margin: '0 8px 10px 0' }}>
          <Form.Item
            noStyle
            label={false}
            name={`${field}Checkbox`}
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox
              data-testid={`${field}-override-checkbox`}
              disabled={isOverrideDisabled}
              onChange={(checkedValues) => {
                handleOverrideCheckboxChange(checkedValues, field)
              }}
            />}
          />
        </Space>
      </Tooltip>}
      { content }
    </UI.FormItem>
  }

  const getFormItemLayout = (isMultipleEdit: boolean) => {
    return isMultipleEdit && {
      labelCol: { span: 8 }, wrapperCol: { span: 16 }
    }
  }

  const renderFormItemChildren = (props: {
    field: string, content: React.ReactNode, tooltip: string
  }) => {
    const { field, content, tooltip } = props
    const shouldRender = shouldRenderMultipleText({
      form, field, hasMultipleValue, isMultipleEdit
    })
    return shouldRender
      ? <div style={{ width: '455px' }}><MultipleText /></div>
      : <Tooltip title={tooltip}>{ content }</Tooltip>
  }

  return (
    <div style={{ height: '80%', minHeight: '200px', marginBottom: '100px' }}>
      <Row gutter={20}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>
            { $t({ defaultMessage:
                  'Select the ports to configure VLAN(s) for this model ({familymodel}):' },
            { familymodel })
            }
          </label>
        </Col>
      </Row>
      {/* ----- Ports ----- */}
      <Row gutter={20} style={{ marginTop: '12px', minHeight: '196px' }} id='portsContainer'>
        <Col>
          { getPortsView(moduleData as PortsType[][][]) }
          <DragSelectionPorts />
        </Col>
      </Row>

      {/* ----- Configuration ----- */}
      { <Row gutter={16}>
        <Col span={24}>
          <Divider style={{ margin: '0 0 22px' }} />
        </Col>
        <Col style={{ opacity: selectedItems?.length ? 1 : 0.4 }}>
          <Subtitle level={4} style={{ marginBottom: '20px' }} >
            { $t({ defaultMessage: 'VLAN Configuration' }) }
          </Subtitle>

          <Form.Item
            name='portSettings'
            hidden={true}
            children={<Input />}
          />
          <Form.Item
            name='ports'
            label={$t({ defaultMessage: 'Selected Ports' })}
            children={<Space style={{ fontSize: '14px', color: 'var(--acx-primary-black)' }}>
              { selectedItems?.length ? selectedItems?.sort().join(', ') : '--' }
            </Space>
            }
          />

          <UI.Form
            form={form}
            layout={isMultipleEdit ? 'horizontal' : 'vertical'}
          >
            { getFieldTemplate({
              field: 'untaggedVlan',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                label={$t({ defaultMessage: 'Untagged VLAN' })}
                children={renderFormItemChildren({
                  field: 'untaggedVlan',
                  tooltip: getFieldDisabledTooltip('untaggedVlan'),
                  content: <Form.Item
                    name='untaggedVlan'
                    style={{ width: isMultipleEdit ? '455px' : '300px' }}
                  >
                    <Select
                      placeholder={$t({ defaultMessage: 'Select VLAN...' })}
                      onChange={handleVlansChange}
                      allowClear
                      disabled={!selectedItems?.length
                        || getUntaggedSelectorDisabled(selectedItems)
                        || getFieldDisabled('untaggedVlan')
                      }
                    >{ getVlanOptions(VlanTypes.UNTAGGED ) }</Select>
                  </Form.Item>
                })}
              />
            })}

            { getFieldTemplate({
              field: 'taggedVlans',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                label={$t({ defaultMessage: 'Tagged VLANs' })}
                children={renderFormItemChildren({
                  field: 'taggedVlans',
                  tooltip: '',
                  content: <Form.Item
                    name='taggedVlans'
                    style={{ width: isMultipleEdit ? '455px' : '300px' }}
                  >
                    <Select
                      mode='multiple'
                      placeholder={$t({ defaultMessage: 'Select VLANs...' })}
                      disabled={!selectedItems?.length
                      || getFieldDisabled('taggedVlans')
                      }
                      onChange={handleVlansChange}
                    >{ getVlanOptions(VlanTypes.TAGGED) }</Select>
                  </Form.Item>
                })}
              />
            })}

          </UI.Form>
        </Col>
      </Row> }
    </div>
  )
}