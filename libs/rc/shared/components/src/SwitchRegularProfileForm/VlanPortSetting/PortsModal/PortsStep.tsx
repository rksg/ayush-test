import React, { useState, useEffect } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import { Row, Col, Form, Typography, Checkbox, Input, Divider, Space } from 'antd'
import { DefaultOptionType }                                           from 'antd/lib/select'
import _                                                               from 'lodash'

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

import { shouldRenderMultipleText, MultipleText }               from '../../../SwitchPortTable/editPortDrawer.utils'
import { getModuleKey, GroupedVlanPort, PortSetting, VlanPort } from '../index.utils'

import {
  getPortsModule,
  getUnit,
  getModule,
  PortsType,
  selectedGroupByPrefix
} from './PortsModal.utils'
import * as UI from './styledComponents'

type PortSettings = Record<string, { untaggedVlan: string[], taggedVlans: string[] }>
type VlanType = 'untaggedVlan' | 'taggedVlans'

enum VlanTypes {
  UNTAGGED = 'untaggedVlan',
  TAGGED = 'taggedVlans'
}

export function PortsStep (props:{
  editRecord?: VlanPort
  vlanList: Vlan[],
  modelPorts?: GroupedVlanPort
}) {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { editRecord, vlanList, modelPorts } = props

  // const [family, setFamily] = useState('')
  // const [model, setModel] = useState('')
  const [portsModule, setPortsModule] = useState<PortsType[][][]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [vlanOptions, setVlanOptions] = useState([] as DefaultOptionType[])

  const [currentModelPortList, setCurrentModelPortList] = useState({} as PortSettings)
  const [currentModulePortList, setCurrentModulePortList] = useState({} as PortSettings)
  const [hasMultipleValue, setHasMultipleValue] = useState(['untaggedVlan'])

  // const [defaultModuleOptions, setDefaultModuleOptions] = useState<CheckboxOptionType[]>()
  // const [slot2, setSlot2] = useState<SwitchSlot>()
  // const [slot3, setSlot3] = useState<SwitchSlot>()

  const { family, model, slots } = form.getFieldsValue(true)
  const familymodel = `${family}-${model}`
  const selectedModuleInfo = Array.from({ length: 3 }, (_, index) => {
    const slotNumber = index + 1
    const slot = slots.find((slot: { slotNumber: number }) => slot.slotNumber === slotNumber)
    return slot?.slotPortInfo?.split('X').join(' X ') || ''
  })

  const isMultipleEdit = selectedItems.length > 1
  const [
    untaggedVlan, taggedVlans, portSettings,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    untaggedVlanCheckbox, taggedVlansCheckbox
  ] = [
    Form.useWatch('untaggedVlan', form),
    Form.useWatch('taggedVlans', form),
    Form.useWatch<PortSetting[]>('portSettings', form),
    Form.useWatch('untaggedVlanCheckbox', form),
    Form.useWatch('taggedVlansCheckbox', form)
  ]

  const getModelPortList = (
    modulekey: string,
    data?: GroupedVlanPort, isFiltered: boolean = false
  ) => {
    return data?.groupbyModules
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
  }

  const getUntaggedSelectorDisabled = ([selectedItem]: string[]) => {
    if (!selectedItem) return false

    const hasUntaggedVlanInModel = !!currentModelPortList?.[selectedItem]?.untaggedVlan?.length
    const hasUntaggedVlanInModule = !!currentModulePortList?.[selectedItem]?.untaggedVlan?.length

    return hasUntaggedVlanInModel && !hasUntaggedVlanInModule
  }

  const getVlanOptionDisabled = (
    portIdentifier: string, type: VlanType
  ) => {
    const portSettings: PortSetting[] = form.getFieldValue('portSettings')
    const checkField = type === VlanTypes.UNTAGGED ? VlanTypes.TAGGED : VlanTypes.UNTAGGED

    //TODO
    const currentModelVlans = _.uniq(
      Object.values(currentModelPortList ?? {}).reduce((result: string[], port) => {
        return result.concat(port.untaggedVlan, port.taggedVlans)
      }, []))
    const currentModuleVlans = _.uniq(
      Object.values(currentModulePortList ?? {}).reduce((result: string[], port) => {
        return result.concat(port.untaggedVlan, port.taggedVlans)
      }, []))

    const unavailableVlans = _.difference(currentModelVlans, currentModuleVlans)

    const assignedVlan = portSettings.filter(port => { //TODO
      return selectedItems.includes(port.port)
    }).map(port => port[checkField]).flat()

    const hasAssigned = assignedVlan.includes(portIdentifier)
    const isUnavailableVlans = unavailableVlans.includes(portIdentifier)

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
      const tooltipTitle = isUnavailableVlans //TODO
      // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'The VLAN has already been configured in other module of this model.' })
        : (hasAssigned
          // eslint-disable-next-line max-len
          ? (isUntaggedType ? $t({ defaultMessage: 'Cannot be same as Untagged VLAN' }) : $t({ defaultMessage: 'Cannot be same as Tagged VLAN' }))
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

  // console.log('*** slots: ', slots)
  // console.log(form.getFieldValue('portSettings'))

  useEffect(() => {
    // const { family, model, slots } = form.getFieldsValue(true)
    /* eslint-disable no-console */
    console.log('vlanList: ', vlanList)
    const vlanOptions = vlanList.map((item) => ({
      label: item.vlanId,
      value: item.vlanId?.toString()
    })).sort((a, b) => Number(a.value) - Number(b.value))

    const modulekey = getModuleKey(family, model, slots)
    const currentModelPortList = getModelPortList(modulekey, modelPorts) //cross module data
    const currentModulePortList = getModelPortList(modulekey, modelPorts, true)

    // setFamily(family)
    // setModel(model)
    setVlanOptions(vlanOptions as DefaultOptionType[])
    setCurrentModelPortList(currentModelPortList as PortSettings)
    setCurrentModulePortList(currentModulePortList as PortSettings)

    console.log('selectedModuleInfo: ', selectedModuleInfo)
    console.log('portSettings: ', portSettings)
    console.log('currentModulePortList: ', currentModulePortList)

    console.log('currentModelPortList: ', currentModelPortList)
    console.log('currentModulePortList: ', currentModulePortList)

  }, [])


  useEffect(() => {
    const portSettings = form.getFieldValue('portSettings')
    const selectPort = portSettings?.filter(
      (p: { port: string }) => selectedItems.includes(p.port))?.[0] //TODO: multiple ports

    form.setFieldsValue({ //TODO
      untaggedVlan: selectedItems?.length === 1 || !hasMultipleValue.includes('untaggedVlan')
        ? selectPort?.untaggedVlan : [],
      taggedVlans: selectedItems?.length === 1 || !hasMultipleValue.includes('taggedVlans')
        ? selectPort?.taggedVlans : []
    })
  }, [selectedItems])

  useEffect(() => {
    if (slots) {
      const module = getPortsModule(slots, false)
      setPortsModule(module as unknown as PortsType[][][])
    }
  }, [slots])

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

      Array.from({ length: portsModule.length }).forEach((_, index) => {
        const ports = portsModule[index].flat()
        ports.forEach((port) => {
          const [unit, slot, portNumber] = port.value.split('/')
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
        // setSelectedItems(selected)
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
    // setSelectedItems(selected)
    handleSelectedItemsChange(selected)

    const checkboxChecked = Object.entries(form.getFieldsValue())
      .filter(v => v?.[1] && v?.[0].includes('Checkbox')).map(v => v?.[0])
    const resetList = checkboxChecked.reduce((obj, c) => ({ ...obj, [c]: false }), {})
    form.setFieldsValue(resetList)
  }

  const getPortInfoTooltip = (port: string) => {
    const { $t } = getIntl()
    const isCurrentPortSelected = selectedItems?.length === 1 && selectedItems[0] === port //TODO: multiple ports

    // const modelUntaggedVlans = currentModelPortList?.[port]?.untaggedVlan ?? []
    // const modelTaggedVlans = currentModelPortList?.[port]?.taggedVlans ?? []

    // const selectedPortVlans = {
    //   untaggedVlan: _.uniq([
    //     ...modelUntaggedVlans, ...(untaggedVlan?.length ? untaggedVlan.toString().split(',') : [])
    //   ]),
    //   taggedVlans: _.uniq([...modelTaggedVlans, ...taggedVlans])
    // }

    // const modulePortVlans = {
    //   untaggedVlan: _.uniq([
    //     ...modelUntaggedVlans, ...(currentModulePortList?.[port]?.untaggedVlan ?? [])
    //   ]),
    //   taggedVlans: _.uniq([
    //     ...modelTaggedVlans, ...(currentModulePortList?.[port]?.taggedVlans ?? [])
    //   ])
    // }

    const selectedPortVlans = {
      untaggedVlan: untaggedVlan?.length ? untaggedVlan.toString().split(',') : [],
      taggedVlans: taggedVlans ?? []
    }

    const modulePortVlans = {
      untaggedVlan: currentModulePortList?.[port]?.untaggedVlan ?? [],
      taggedVlans: currentModulePortList?.[port]?.taggedVlans ?? []
    }

    const portVlanInfo = isCurrentPortSelected ? selectedPortVlans : modulePortVlans

    return <div>
      <UI.TooltipTitle>{
        $t(PortStatusMessages.CURRENT)
      }</UI.TooltipTitle>
      <div>
        <UI.TagsTitle>
          <UI.TagsOutlineIcon />{ $t({ defaultMessage: 'Untagged' }) }
        </UI.TagsTitle>
        <UI.PortSpan>{ portVlanInfo.untaggedVlan.join(', ') || '-' }</UI.PortSpan></div>
      <div>
        <UI.TagsTitle>
          <UI.TagsSolidIcon />{ $t({ defaultMessage: 'Tagged' }) }
        </UI.TagsTitle>
        <UI.PortSpan>{ portVlanInfo.taggedVlans.join(', ') || '-' }</UI.PortSpan>
      </div>
    </div>
  }

  const getPortLabel = (port: number, slot: number) => {
    // const { family, model } = form.getFieldsValue(true)
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

  const getPortsView = () => {
    return portsModule.map((module, index) => {
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
            // setSelectedItems([])
            handleSelectedItemsChange([])
          }}>
          {$t({ defaultMessage: 'Clear Selection' })}
        </Button>
      </React.Fragment>
    })
  }

  const itemFields = ['taggedVlans', 'untaggedVlan']
  const handleSelectedItemsChange = (selected: string[]) => {
    console.log('handleSelectedItemsChange: ', selected, portSettings)
    const selectedPortSetting = selected.map(port => {
      const settings = portSettings.find(p => port === p.port)
      return settings ? settings : { taggedVlans: [''], untaggedVlan: [''] }
    }) as PortSetting[]


    console.log('selectedPorts: ', selectedPortSetting)

    const hasMultipleValueFields = itemFields?.filter(field => {
      const fieldValues = selectedPortSetting
        .map(s => s[field as keyof PortSetting])
        .flatMap(v => Array.isArray(v) && v.length === 0 ? '' : v)

      const isEqual = _.uniq(fieldValues).length === 1
      return !isEqual && field
    })

    setHasMultipleValue(hasMultipleValueFields)
    setSelectedItems(selected)

    const checkboxChecked = Object.entries(form.getFieldsValue())
      .filter(v => v?.[1] && v?.[0].includes('Checkbox')).map(v => v?.[0])
    const resetList = checkboxChecked.reduce((obj, c) => ({ ...obj, [c]: false }), {})
    form.setFieldsValue(resetList)
  }

  const handleVlansChange = () => {
    const { untaggedVlan = [], taggedVlans = [], portSettings = [] } = form.getFieldsValue()
    const overrideUntaggedVlan = selectedItems.length === 1 || untaggedVlanCheckbox
    const overrideTaggedVlans = selectedItems.length === 1 || taggedVlansCheckbox
    console.log('**** handleVlansChange: ', untaggedVlan, taggedVlans, portSettings)
    const updatePortSettings = selectedItems?.map((port) => {
      return {
        id: `${familymodel}-${port}`,
        port,
        untaggedVlan: overrideUntaggedVlan
          ? Array.isArray(untaggedVlan) ? untaggedVlan : [untaggedVlan] as string[]
          : (currentModulePortList[port]?.untaggedVlan ?? []),
        taggedVlans: overrideTaggedVlans
          ? (taggedVlans as string[]) : (currentModulePortList[port]?.taggedVlans ?? [])
      }
    })

    setCurrentModulePortList({
      ..._.omitBy(currentModulePortList, (value, key) => selectedItems.includes(key)),
      ...updatePortSettings.reduce((result, port) => {
        return {
          ...result,
          [port.port]: {
            untaggedVlan: port.untaggedVlan,
            taggedVlans: port.taggedVlans
          }
        }
      }, {})
    })

    form.setFieldValue('portSettings', [
      ...portSettings.filter((p: { port: string }) => !selectedItems.includes(p.port)),
      ...updatePortSettings
    ])
  }

  ///
  const getFieldDisabled = (field: string) => {
    const checkboxEnabled = form?.getFieldValue(`${field}Checkbox`)
    switch (field) {
      default:
        return isMultipleEdit && !checkboxEnabled
    }
  }

  const getOverrideDisabled = (field: string) => {
    switch (field) {
      default:
        return false
    }
  }

  const getFieldTemplate = (props: {
      content: React.ReactNode,
      field: string,
      extraLabel?: boolean
    }) => {
    const { content, field } = props
    return <UI.FormItem>
      { isMultipleEdit && <Form.Item
        noStyle
        label={false}
        name={`${field}Checkbox`}
        valuePropName='checked'
        initialValue={false}
        children={<Checkbox
          data-testid={`${field}-override-checkbox`}
          disabled={getOverrideDisabled(field)}
        />}
      /> }
      { content }
    </UI.FormItem>
  }

  const getFormItemLayout = (isMultipleEdit: boolean) => {
    return isMultipleEdit && {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
      // style: { width: '75%' }
    }
  }

  const renderFormItemChildren = (props: {
    field: string, content: React.ReactNode
  }) => {
    const { field, content } = props
    const shouldRender = shouldRenderMultipleText({
      form, field, hasMultipleValue, isMultipleEdit
    })
    return shouldRender ? <MultipleText /> : content
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
      <Row gutter={20} style={{ marginTop: '12px', minHeight: '175px' }} id='portsContainer'>
        <Col>
          { getPortsView() }
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
              { selectedItems?.length ? selectedItems?.join(', ') : '--' }
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
                name='untaggedVlan'
                label={$t({ defaultMessage: 'Untagged VLAN' })}
                style={{ width: isMultipleEdit ? '455px' : '300px' }}
                children={renderFormItemChildren({
                  field: 'untaggedVlan',
                  content: <Tooltip title={getUntaggedSelectorDisabled(selectedItems)
                    // eslint-disable-next-line max-len
                    ? $t({ defaultMessage: 'In this model, the port has already been configured with an Untagged VLAN in a different module.' })
                    : ''
                  }>
                    <Select
                      placeholder={$t({ defaultMessage: 'Select VLAN...' })}
                      onChange={handleVlansChange}
                      allowClear
                      disabled={!selectedItems?.length
                    || getUntaggedSelectorDisabled(selectedItems)
                    || getFieldDisabled('untaggedVlan')
                      }
                    >{ getVlanOptions(VlanTypes.UNTAGGED) }</Select>
                  </Tooltip>
                })}

                // children={shouldRenderMultipleText({
                //   form, field: 'untaggedVlan', hasMultipleValue, isMultipleEdit
                // }) ? <MultipleText />
                //   : <Select
                //     placeholder={$t({ defaultMessage: 'Select VLAN...' })}
                //     onChange={handleVlansChange}
                //     allowClear
                //     disabled={!selectedItems?.length
                //     || getUntaggedSelectorDisabled(selectedItems)
                //     || getFieldDisabled('untaggedVlan')
                //     }
                //   >{ getVlanOptions(VlanTypes.UNTAGGED)
                //     }</Select>}
              />
            })}

            { getFieldTemplate({
              field: 'taggedVlans',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='taggedVlans'
                label={$t({ defaultMessage: 'Tagged VLANs' })}
                style={{ width: isMultipleEdit ? '455px' : '300px' }}
                children={renderFormItemChildren({
                  field: 'taggedVlans',
                  content: <Select
                    mode='multiple'
                    placeholder={$t({ defaultMessage: 'Select VLANs...' })}
                    disabled={!selectedItems?.length
                    || getFieldDisabled('taggedVlans')
                    }
                    onChange={handleVlansChange}
                  >{ getVlanOptions(VlanTypes.TAGGED) }</Select>
                })}

                // children={shouldRenderMultipleText({
                //   form, field: 'taggedVlans', hasMultipleValue, isMultipleEdit
                // }) ? <MultipleText />
                //   : <Select
                //     mode='multiple'
                //     placeholder={$t({ defaultMessage: 'Select VLANs...' })}
                //     disabled={!selectedItems?.length
                //     || getFieldDisabled('taggedVlans')
                //     }
                //     onChange={handleVlansChange}
                //   >{
                //       getVlanOptions(VlanTypes.TAGGED)
                //     }</Select>}
              />
            })}

            {/* <Form.Item
              name='untaggedVlan'
              label={$t({ defaultMessage: 'Untagged VLAN' })}
              style={{ width: '300px' }}
              children={<Select
                placeholder={$t({ defaultMessage: 'Select VLAN...' })}
                onChange={handleVlansChange}
                allowClear
                disabled={!selectedItems?.length
                  || getUntaggedSelectorDisabled(selectedItems)
                }
              >{ getVlanOptions(VlanTypes.UNTAGGED)
                }</Select>}
            />
            <Form.Item
              name='taggedVlans'
              label={$t({ defaultMessage: 'Tagged VLANs' })}
              style={{ width: '300px' }}
              children={
                <Select
                  mode='multiple'
                  placeholder={$t({ defaultMessage: 'Select VLANs...' })}
                  disabled={!selectedItems?.length}
                  onChange={handleVlansChange}
                >{
                    getVlanOptions(VlanTypes.TAGGED)
                  }</Select>
              }
            /> */}

          </UI.Form>
        </Col>
      </Row> }
    </div>
  )
}