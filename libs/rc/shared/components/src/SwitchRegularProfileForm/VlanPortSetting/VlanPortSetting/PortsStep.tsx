import React                   from 'react'
import { useState, useEffect } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import { Row, Col, Form, Typography, Checkbox, Input, Divider, Select, Space } from 'antd'
import { DefaultOptionType }                                                   from 'antd/lib/select'
import _                                                                       from 'lodash'

import {
  Button,
  Subtitle,
  Tooltip
} from '@acx-ui/components'
import {
  SwitchSlot2 as SwitchSlot,
  getSwitchPortLabel,
  PortStatusMessages,
  SwitchModelPortData,
  // SwitchPortViewModel,
  Vlan
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

// import { getTooltipTemplate } from '../'
import { GroupedVlanPort, VlanPort } from '..'

import * as UI            from './styledComponents'
import {
  checkIfModuleFixed,
  getPortsModule,
  getUnit,
  // getUnitTitle,
  getModule,
  PortsType,
  selectedGroupByPrefix
} from './VlanPortSetting.utils'

type PortSettings = Record<string, { untaggedVlan: string[], taggedVlans: string[] }>

export function PortsStep (props:{
  editRecord?: VlanPort
  vlanList: Vlan[],
  modelPorts?: GroupedVlanPort
}) {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { editRecord, vlanList, modelPorts } = props //portsData,
  // const {
  //   family, model, vlanSettingValues, setVlanSettingValues, vlanList, isSwitchLevel,
  // } = useContext(VlanPortsContext)

  const [portsModule, setPortsModule] = useState<PortsType[][][]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [family, setFamily] = useState('')
  const [model, setModel] = useState('')
  const [vlanOptions, setVlanOptions] = useState([] as DefaultOptionType[])
  const [switchFamilyModels, setSwitchFamilyModels] = useState({} as SwitchModelPortData)

  const [currentModelPortList, setCurrentModelPortList] = useState({} as PortSettings)
  // const [filteredModelPortList, setFilteredModelPortList] = useState({} as PortSettings)

  // const [defaultModuleOptions, setDefaultModuleOptions] = useState<CheckboxOptionType[]>()
  const [slot2, setSlot2] = useState<SwitchSlot>()
  const [slot3, setSlot3] = useState<SwitchSlot>()

  const [untaggedVlan, taggedVlans] = [ //portSettings
    // Form.useWatch('portSettings', form),
    Form.useWatch('untaggedVlan', form),
    Form.useWatch('taggedVlans', form)
  ]

  const getModelPortList = (
    moduleCategorykey: string,
    data?: GroupedVlanPort, isFiltered: boolean = false
  ) => {
    return data?.groupbyModules
      .filter(module => {
        return !isFiltered || (
          editRecord ? module.key === editRecord?.key : module.key === moduleCategorykey
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

  useEffect(() => {
    const { family, model, switchFamilyModels } = form.getFieldsValue(true)
    const vlanOptions = vlanList.map((item) => ({
      label: item.vlanId,
      value: item.vlanId.toString()
    })).sort((a, b) => Number(a.value) - Number(b.value))

    const moduleFixed = checkIfModuleFixed(family, model) ////
    const isDefaultModule = moduleFixed?.moduleSelectionEnable === false
    const enableModuleInfo = (switchFamilyModels as SwitchModelPortData)?.slots
      .filter(slot => slot.slotNumber !== 1)
      .map(slot => {
        return `Module ${slot.slotNumber}: ${slot.option}`
      }).sort()

    const moduleCategory = isDefaultModule ? ['Module: Default'] : enableModuleInfo
    const moduleCategorykey = moduleCategory?.length ?
      `${family}-${model}_${moduleCategory.toString()}` : `${family}-${model}_--`

    const currentModelPortList = getModelPortList(moduleCategorykey, modelPorts)
    // const filteredModelPortList = getModelPortList(moduleCategorykey, modelPorts, true)

    setFamily(family)
    setModel(model)
    setVlanOptions(vlanOptions as DefaultOptionType[])
    setCurrentModelPortList(currentModelPortList as PortSettings)
    // setFilteredModelPortList(filteredModelPortList as PortSettings)
    setSwitchFamilyModels(switchFamilyModels as SwitchModelPortData) ///

    // console.log('switchFamilyModels: ', switchFamilyModels)
    // setDefaultModuleOptions(defaultModuleOptions)
  }, [])


  useEffect(() => {
    const portSettings = form.getFieldValue('portSettings')
    const selectPort = portSettings?.filter(
      (p: { port: string }) => selectedItems.includes(p.port))?.[0] //TODO

    form.setFieldsValue({
      untaggedVlan: selectPort?.untaggedVlan ?? [],
      taggedVlans: selectPort?.taggedVlans ?? []
    })
  }, [selectedItems])

  useEffect(() => {
    const { slots } = switchFamilyModels
    if (slots) {
      const module = getPortsModule(slots, false)
      setPortsModule(module as unknown as PortsType[][][])

      const slot2Data = slots.find(item => item.slotNumber === 2)
      if(slot2Data?.portStatus){
        setSlot2(slot2Data)
      }

      const slot3Data = slots.find(item => item.slotNumber === 3)
      if(slot3Data?.portStatus){
        setSlot3(slot3Data)
      }
    }
  }, [switchFamilyModels])

  let tmpUntaggedSelectedItem: string[] = []
  const { DragSelection: DragSelectionUntaggedPorts } = useSelectionContainer({
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
      tmpUntaggedSelectedItem = []
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
                tmpUntaggedSelectedItem.push(item.dataset.value)
              }
            }
          }
        })
      })

      tmpUntaggedSelectedItem = _.uniq(tmpUntaggedSelectedItem)
    },
    onSelectionEnd: () => {
      const selectedVlanPort = selectedItems //form.getFieldValue(['switchFamilyModels', 'untaggedPorts']) || []
      const vlanPorts = _.xor(selectedVlanPort, tmpUntaggedSelectedItem)

      if (tmpUntaggedSelectedItem) {
        setSelectedItems(vlanPorts)
      }

      // form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], vlanPorts)

      // setVlanSettingValues({
      //   ...vlanSettingValues,
      //   switchFamilyModels: {
      //     id: vlanSettingValues.switchFamilyModels?.id,
      //     model: vlanSettingValues.switchFamilyModels?.model || '',
      //     slots: vlanSettingValues.switchFamilyModels?.slots || [],
      //     untaggedPorts: vlanPorts,
      //     taggedPorts: vlanSettingValues.switchFamilyModels?.taggedPorts || []
      //   }
      // })
      tmpUntaggedSelectedItem = []
    },
    isEnabled: true
  })

  const handleCheckboxGroupChange = (checkedValues: string[], moduleGroup: string) => {
    const selectedUntaggedPorts = selectedItems //form.getFieldValue(['switchFamilyModels', 'untaggedPorts'])
    const selectedUntaggedGroupByPrefix = selectedGroupByPrefix(selectedUntaggedPorts)

    const selected = _.uniq([
      ...Object.values(_.omit(selectedUntaggedGroupByPrefix, moduleGroup)).flat(),
      ...checkedValues
    ])
    setSelectedItems(selected)

    // form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], selected)
    // setVlanSettingValues({
    //   ...vlanSettingValues,
    //   switchFamilyModels: {
    //     id: vlanSettingValues.switchFamilyModels?.id,
    //     model: vlanSettingValues.switchFamilyModels?.model || '',
    //     slots: vlanSettingValues.switchFamilyModels?.slots || [],
    //     untaggedPorts: selected,
    //     taggedPorts: vlanSettingValues.switchFamilyModels?.taggedPorts || []
    //   }
    // })
  }

  // const checkAuthPort = (timeslot: string) => {
  //   let isAuthPort = false
  //   if(portsData) {
  //     isAuthPort = !!portsData.find(i => i.portIdentifier === timeslot)?.authDefaultVlan
  //   }
  //   return isAuthPort
  // }



  const getTooltip = (port: string) => {
    const { $t } = getIntl()
    const isSelectedPort = selectedItems?.length === 1 && selectedItems[0] === port

    // const portInfo = portSettings?.filter((p: { port: string }) => port.includes(p.port))?.[0]
    const portInfo = currentModelPortList?.[port]
    const untagged = isSelectedPort
      ? untaggedVlan?.toString().split(',').join(', ') : portInfo?.untaggedVlan //portInfo?.untaggedVlan?.join(', ')
    const tagged = isSelectedPort
      ? taggedVlans.join(', ') : portInfo?.taggedVlans?.join(', ')

    return <div>
      <UI.TooltipTitle>{
        $t(PortStatusMessages.CURRENT)
      }</UI.TooltipTitle>
      <div>
        <UI.TagsTitle>
          <UI.TagsOutlineIcon />{ $t({ defaultMessage: 'Untagged' }) }
        </UI.TagsTitle>
        <UI.PortSpan>{ untagged || '-' }</UI.PortSpan></div>
      <div>
        <UI.TagsTitle>
          <UI.TagsSolidIcon />{ $t({ defaultMessage: 'Tagged' }) }
        </UI.TagsTitle>
        <UI.PortSpan>{ tagged || '-' }</UI.PortSpan>
      </div>
    </div>
  }

  const getPortLabel = (port: number, slot: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [family, model] = editRecord?.familymodel?.split('-') ?? []
    // const model = vlanSettingValues.switchFamilyModels?.model || ''
    const portLabel = getSwitchPortLabel(model, slot) + port.toString()
    return portLabel
  }

  const getFormattedModuleOptions = (
    modulePorts: PortsType[], unit: number, moduleIndex: number
  ) => {
    return modulePorts?.map((port, i) => ({
      label: <Tooltip
        title={getTooltip(port.value)}
      >
        <div
          id={`module${unit}_${moduleIndex}_${i+1}`}
          data-value={port.value}
          data-testid={`module${unit}_${moduleIndex}_${i+1}`}
          data-disabled={false}
          // data-disabled={getDisabledPorts(timeslot.value)}
          style={{ width: '20px', height: '20px' }}
        >
        </div>
        <p>{getPortLabel(i+1, moduleIndex)}</p>
      </Tooltip>,
      value: port.value,
      disabled: false
      // disabled: getDisabledPorts(timeslot.value)
    }))
  }

  const getModuleBlock = () => {
    return portsModule.map((module, index) => {
      const unit = getUnit(module)
      const module2 = getModule(module, '2', unit)
      const module3 = getModule(module, '3', unit)

      const moduleOptions = [
        module?.[0], getModule(module, '2', unit), getModule(module, '3', unit)
      ]
      const formattedModuleOptions = moduleOptions.map(
        (options, index) => getFormattedModuleOptions(options, unit, index + 1)
      )

      return <React.Fragment key={`module${index}`}>
        <UI.CardStyle key={`card${index}`}>
          <Row gutter={20} className='content'>
            <Col>
              <div>
                <Typography.Text style={{ fontWeight: 'bold' }}>
                  {$t({ defaultMessage: 'Module 1' })}
                </Typography.Text>
              </div>
              { switchFamilyModels?.slots[0] &&
            <Typography.Paragraph>
              {$t({ defaultMessage: '{module1}' },
                { module1: switchFamilyModels?.slots[0].slotPortInfo
                  ?.split('X').join(' X ') })}
            </Typography.Paragraph>
              }
              <UI.Module>
                <Checkbox.Group
                  key={`checkboxGroup_module${unit}_1`}
                  className='lightblue'
                  onChange={(checkedValues) =>
                    handleCheckboxGroupChange(
                    checkedValues as string[], `${unit}/1`
                    )
                  }
                  value={selectedItems}
                  options={formattedModuleOptions[0]}
                />
              </UI.Module>
            </Col>
            { module2 && <Col>
              <Row gutter={20}>
                <Col>
                  <div>
                    <Typography.Text style={{ fontWeight: 'bold' }}>
                      {$t({ defaultMessage: 'Module 2' })}
                    </Typography.Text>
                  </div>
                  <Typography.Paragraph>
                    {$t({ defaultMessage: '{module2}' },
                      { module2: slot2?.slotPortInfo?.split('X').join(' X ') })}
                  </Typography.Paragraph>
                  <UI.Module>
                    <Checkbox.Group
                      key={`checkboxGroup_module${unit}_2`}
                      className='lightblue'
                      onChange={(checkedValues) =>
                        handleCheckboxGroupChange(
                        checkedValues as string[], `${unit}/2`
                        )
                      }
                      value={selectedItems}
                      options={formattedModuleOptions[1]}
                    />
                  </UI.Module>
                </Col>
              </Row>
            </Col>
            }
            { module3 && <Col>
              <div>
                <Typography.Text style={{ fontWeight: 'bold' }}>
                  {$t({ defaultMessage: 'Module 3' })}
                </Typography.Text>
              </div>
              <Typography.Paragraph>
                {$t({ defaultMessage: '{module3}' },
                  { module3: slot3?.slotPortInfo?.split('X').join(' X ') })}
              </Typography.Paragraph>
              <UI.Module>
                <Checkbox.Group
                  key={`checkboxGroup_module${unit}_3`}
                  className='lightblue'
                  onChange={(checkedValues) =>
                    handleCheckboxGroupChange(
                    checkedValues as string[], `${unit}/3`
                    )
                  }
                  value={selectedItems}
                  options={formattedModuleOptions[2]}
                />
              </UI.Module>
            </Col>
            }
          </Row>
        </UI.CardStyle>
        <Button
          type='link'
          size='small'
          disabled={!selectedItems?.length}
          style={{ float: 'right', marginBottom: '20px' }}
          onClick={() => {
            setSelectedItems([])
          }}>
          {$t({ defaultMessage: 'Clear Selection' })}
        </Button>
      </React.Fragment>
    })
  }

  const handleVlansChange = () => {
    const { untaggedVlan, taggedVlans, portSettings = [] } = form.getFieldsValue()
    const updatePortSettings = selectedItems?.map((port) => {
      return {
        id: `${family}-${model}-${port}`,
        port,
        untaggedVlan: Array.isArray(untaggedVlan) ? untaggedVlan : [untaggedVlan] as string[],
        taggedVlans: taggedVlans as string[]
      }
    })

    form.setFieldValue('portSettings', [
      ...portSettings.filter((p: { port: string }) => !selectedItems.includes(p.port)),
      ...updatePortSettings
    ])
  }

  return (
    <div style={{ height: '80%', minHeight: '200px', marginBottom: '100px' }}>
      <Row gutter={20}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>
            { $t({ defaultMessage:
                  'Select the ports to configure VLAN(s) for this model ({family}-{model}):' },
            { family, model })
            }
          </label>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '12px', minHeight: '175px' }} id='portsContainer'>
        <Col>
          { getModuleBlock() }
          <DragSelectionUntaggedPorts />
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
          <Form.Item
            name='untaggedVlan'
            label={$t({ defaultMessage: 'Untagged VLANs' })}
            style={{ width: '300px' }}
            children={<Select
              options={vlanOptions}
              placeholder={$t({ defaultMessage: 'Select VLANs...' })}
              onChange={handleVlansChange}
              disabled={!selectedItems?.length
                || !!currentModelPortList?.[selectedItems[0]]?.untaggedVlan?.length
              }
            />}
          />
          <Form.Item
            name='taggedVlans'
            label={$t({ defaultMessage: 'Tagged VLANs' })}
            style={{ width: '300px' }}
            children={<Select
              mode='multiple'
              options={vlanOptions}
              placeholder={$t({ defaultMessage: 'Select VLANs...' })}
              disabled={!selectedItems?.length}
              onChange={handleVlansChange}
              // disabled={!isValidTwiliosService}
            />}
          />
        </Col>
      </Row>}

      {/* <Form.Item
        name={['switchFamilyModels', 'untaggedPorts']}
        hidden={true}
        children={<Input />}
      /> */}

    </div>
  )
}