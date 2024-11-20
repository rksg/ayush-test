
import { useState, useEffect, useContext } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import { Row, Col, Form, Typography, Checkbox, Input } from 'antd'
import _                                               from 'lodash'

import { Tooltip }                                                                                from '@acx-ui/components'
import { SwitchSlot2 as SwitchSlot, getSwitchPortLabel, PortStatusMessages, SwitchPortViewModel } from '@acx-ui/rc/utils'
import { getIntl }                                                                                from '@acx-ui/utils'

import { getTooltipTemplate } from '../'

import * as UI                                                                                from './styledComponents'
import VlanPortsContext                                                                       from './VlanPortsContext'
import { getPortsModule, getUnit, getUnitTitle, getModule, PortsType, selectedGroupByPrefix } from './VlanPortsModal.utils'

export function UntaggedPortsStep (props:{ portsData?: SwitchPortViewModel[] }) {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { portsData } = props
  const {
    vlanSettingValues, setVlanSettingValues, vlanList, isSwitchLevel, portsUsedBy
  } = useContext(VlanPortsContext)

  const [portsModule, setPortsModule] = useState<PortsType[][][]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const [slot2, setSlot2] = useState<SwitchSlot>()
  const [slot3, setSlot3] = useState<SwitchSlot>()

  useEffect(() => {
    if(vlanSettingValues){
      if (vlanSettingValues.switchFamilyModels?.slots) {
        const module = getPortsModule(vlanSettingValues.switchFamilyModels?.slots, isSwitchLevel)
        setPortsModule(module as unknown as PortsType[][][])
      }

      const slot2Data = vlanSettingValues.switchFamilyModels?.slots
        .filter(item => item.slotNumber === 2)
      if(slot2Data && slot2Data[0] && slot2Data[0].portStatus!== undefined){
        setSlot2(slot2Data[0])
      }

      const slot3Data = vlanSettingValues.switchFamilyModels?.slots
        .filter(item => item.slotNumber === 3)
      if(slot3Data && slot3Data[0] && slot3Data[0].portStatus!== undefined){
        setSlot3(slot3Data[0])
      }

      if(vlanSettingValues.switchFamilyModels?.untaggedPorts){
        const untaggedPorts = vlanSettingValues.switchFamilyModels?.untaggedPorts
          .toString().split(',').filter(item => item !== '')
        form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], untaggedPorts)

        setSelectedItems(untaggedPorts)
      }else{
        form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], [])
        setSelectedItems([])
      }
    }
  }, [vlanSettingValues])

  let tmpUntaggedSelectedItem: string[] = []
  const { DragSelection: DragSelectionUntaggedPorts } = useSelectionContainer({
    eventsElement: document.getElementById('unTaggedContainer'),
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
          const itemKey = `untagged_module${unit}_${slot}_${portNumber}`
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
      const selectedVlanPort = form.getFieldValue(['switchFamilyModels', 'untaggedPorts']) || []
      const vlanPorts = _.xor(selectedVlanPort,tmpUntaggedSelectedItem)

      setSelectedItems(vlanPorts)
      form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], vlanPorts)

      setVlanSettingValues({
        ...vlanSettingValues,
        switchFamilyModels: {
          id: vlanSettingValues.switchFamilyModels?.id,
          model: vlanSettingValues.switchFamilyModels?.model || '',
          slots: vlanSettingValues.switchFamilyModels?.slots || [],
          untaggedPorts: vlanPorts,
          taggedPorts: vlanSettingValues.switchFamilyModels?.taggedPorts || []
        }
      })
      tmpUntaggedSelectedItem = []
    },
    isEnabled: true
  })

  const handleCheckboxGroupChange = (checkedValues: string[], moduleGroup: string) => {
    const selectedUntaggedPorts = form.getFieldValue(['switchFamilyModels', 'untaggedPorts'])
    const selectedUntaggedGroupByPrefix = selectedGroupByPrefix(selectedUntaggedPorts)

    const selected = _.uniq([
      ...Object.values(_.omit(selectedUntaggedGroupByPrefix, moduleGroup)).flat(),
      ...checkedValues
    ])
    setSelectedItems(selected)

    form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], selected)
    setVlanSettingValues({
      ...vlanSettingValues,
      switchFamilyModels: {
        id: vlanSettingValues.switchFamilyModels?.id,
        model: vlanSettingValues.switchFamilyModels?.model || '',
        slots: vlanSettingValues.switchFamilyModels?.slots || [],
        untaggedPorts: selected,
        taggedPorts: vlanSettingValues.switchFamilyModels?.taggedPorts || []
      }
    })
  }

  const checkAuthPort = (timeslot: string) => {
    let isAuthPort = false
    if(portsData) {
      isAuthPort = !!portsData.find(i => i.portIdentifier === timeslot)?.authDefaultVlan
    }
    return isAuthPort
  }

  const getDisabledPorts = (timeslot: string) => {
    const isAuthPort = checkAuthPort(timeslot)
    const vlanSelectedPorts = vlanList ? vlanList.map(item => item.switchFamilyModels
      ?.filter(obj => obj.model === vlanSettingValues.switchFamilyModels?.model)) : []

    const portExists = vlanSelectedPorts.map(item => item?.map(
      obj => { return obj.untaggedPorts?.split(',').includes(timeslot)}))
      .some(item => item?.some(element => element === true))

    const taggedPorts =
      vlanSettingValues.switchFamilyModels?.taggedPorts?.toString().split(',') || []

    const disabledPorts
      = taggedPorts.includes(timeslot)
      || Object.keys(portsUsedBy?.lag ?? {})?.includes(timeslot)
      || Object.keys(portsUsedBy?.untagged ?? {})?.includes(timeslot)
      || portExists || false
      || isAuthPort

    return disabledPorts
  }

  const getTooltip = (timeslot: string) => {
    const isAuthPort = checkAuthPort(timeslot)
    const taggedPorts =
    vlanSettingValues.switchFamilyModels?.taggedPorts?.toString().split(',') || []

    const untaggedModel = vlanList ?
      vlanList.filter(item => item.switchFamilyModels?.some(
        switchModel => switchModel.model === vlanSettingValues.switchFamilyModels?.model &&
        switchModel.untaggedPorts?.split(',').includes(timeslot))) : []

    const taggedModel = vlanList ?
      vlanList.filter(item => item.switchFamilyModels?.some(
        switchModel => switchModel.model === vlanSettingValues.switchFamilyModels?.model &&
        switchModel.taggedPorts?.split(',')?.includes(timeslot))) : []

    if (isAuthPort) {
      return <div>{$t(PortStatusMessages.USED_BY_AUTH)}</div>
    } else if(taggedPorts.includes(timeslot)){
      return <div>{$t(PortStatusMessages.SET_AS_TAGGED)}</div>
    } else if (Object.keys(portsUsedBy?.lag ?? {})?.includes(timeslot)) {
      return <div>{
        $t(PortStatusMessages.USED_BY_LAG, { lagName: portsUsedBy?.lag?.[timeslot] })
      }</div>
    } else if (Object.keys(portsUsedBy?.untagged ?? {})?.includes(timeslot)) {
      return <div>{
        $t(PortStatusMessages.USED_UNTAGGED_VLAN, { vlanId: portsUsedBy?.untagged?.[timeslot] })
      }</div>
    } else{
      return getTooltipTemplate(untaggedModel, taggedModel)
    }
  }

  const getPortLabel = (port: number, slot: number) => {
    const model = vlanSettingValues.switchFamilyModels?.model || ''
    const portLabel = getSwitchPortLabel(model, slot) + port.toString()
    return portLabel
  }

  return (
    <div style={{ height: '80%', minHeight: '200px', marginBottom: '100px' }}>
      <Row gutter={20}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>
            {isSwitchLevel
              ? $t({ defaultMessage: 'Select the untagged ports (access ports)' })
              : $t({ defaultMessage:
                  'Select the untagged ports (access ports) for this model ({family}-{model}):' },
              { family: vlanSettingValues.family, model: vlanSettingValues.model })
            }
          </label>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '20px' }} id='unTaggedContainer'>
        <Col>
          { portsModule.map((module, index) => {
            return <UI.CardStyle key={`card${index}`}>
              { vlanSettingValues?.stackMember &&
                <Row gutter={20} className='title'>{
                  getUnitTitle(module, vlanSettingValues?.stackMember)
                }</Row>
              }
              <Row gutter={20} className='content'>
                <Col>
                  <div>
                    <Typography.Text style={{ fontWeight: 'bold' }}>
                      {$t({ defaultMessage: 'Module 1' })}
                    </Typography.Text>
                  </div>
                  { vlanSettingValues.switchFamilyModels?.slots[0] &&
                  <Typography.Paragraph>
                    {$t({ defaultMessage: '{module1}' },
                      { module1: vlanSettingValues.switchFamilyModels?.slots[0].slotPortInfo
                        ?.split('X').join(' X ') })}
                  </Typography.Paragraph>
                  }
                  <UI.Module>
                    <Checkbox.Group
                      key={`checkboxGroup_module${getUnit(module)}_1`}
                      className='lightblue'
                      onChange={(checkedValues) =>
                        handleCheckboxGroupChange(
                          checkedValues as string[], `${getUnit(module)}/1`
                        )
                      }
                      value={selectedItems}
                      options={(module[0]).map((timeslot, i) => ({
                        label: <Tooltip
                          title={getTooltip(timeslot.value)}
                        >
                          <div
                            id={`untagged_module${getUnit(module)}_1_${i+1}`}
                            data-value={timeslot.value}
                            data-testid={`untagged_module${getUnit(module)}_1_${i+1}`}
                            data-disabled={getDisabledPorts(timeslot.value)}
                            style={{ width: '20px', height: '20px' }}
                          >
                          </div>
                          <p>{getPortLabel(i+1, 1)}</p>
                        </Tooltip>,
                        value: timeslot.value,
                        disabled: getDisabledPorts(timeslot.value)
                      }))}
                    />
                  </UI.Module>
                </Col>
                { getModule(module, '2') && <Col>
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
                          key={`checkboxGroup_module${getUnit(module)}_2`}
                          className='lightblue'
                          onChange={(checkedValues) =>
                            handleCheckboxGroupChange(
                              checkedValues as string[], `${getUnit(module)}/2`
                            )
                          }
                          value={selectedItems}
                          options={(getModule(module, '2')).map((timeslot, i) => ({
                            label: <Tooltip
                              title={getTooltip(timeslot.value)}
                            >
                              <div
                                id={`untagged_module${getUnit(module)}_2_${i+1}`}
                                data-value={timeslot.value}
                                data-testid={`untagged_module${getUnit(module)}_2_${i+1}`}
                                data-disabled={getDisabledPorts(timeslot.value)}
                                style={{ width: '20px', height: '20px' }}
                              ></div>
                              <p>{getPortLabel(i+1, 2)}</p>
                            </Tooltip>,
                            value: timeslot.value,
                            disabled: getDisabledPorts(timeslot.value)
                          }))}
                        />
                      </UI.Module>
                    </Col>
                  </Row>
                </Col>
                }
                { getModule(module, '3') && <Col>
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
                      key={`checkboxGroup_module${getUnit(module)}_3`}
                      className='lightblue'
                      onChange={(checkedValues) =>
                        handleCheckboxGroupChange(
                          checkedValues as string[], `${getUnit(module)}/3`
                        )
                      }
                      value={selectedItems}
                      options={(getModule(module, '3')).map((timeslot, i) => ({
                        label: <Tooltip
                          title={getTooltip(timeslot.value)}
                        >
                          <div
                            id={`untagged_module${getUnit(module)}_3_${i+1}`}
                            data-value={timeslot.value}
                            data-testid={`untagged_module${getUnit(module)}_3_${i+1}`}
                            data-disabled={getDisabledPorts(timeslot.value)}
                            style={{ width: '20px', height: '20px' }}
                          ></div>
                          <p>{getPortLabel(i+1, 3)}</p>
                        </Tooltip>,
                        value: timeslot.value,
                        disabled: getDisabledPorts(timeslot.value)
                      }))}
                    />
                  </UI.Module>
                </Col>
                }
              </Row>
            </UI.CardStyle>
          }) }

          <DragSelectionUntaggedPorts />
        </Col>
      </Row>
      <Form.Item
        name={['switchFamilyModels', 'untaggedPorts']}
        hidden={true}
        children={<Input />}
      />
    </div>
  )
}