
import { useState, useEffect, useContext } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import { Row, Col, Form, Typography, Checkbox, Input } from 'antd'
import _                                               from 'lodash'

import { Card, Tooltip }                                 from '@acx-ui/components'
import { SwitchSlot2 as SwitchSlot, getSwitchPortLabel } from '@acx-ui/rc/utils'
import { getIntl }                                       from '@acx-ui/utils'

import * as UI          from './styledComponents'
import VlanPortsContext from './VlanPortsContext'

export interface PortsType {
  label: string,
  value: string
}

export function UntaggedPortsStep () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const {
    vlanSettingValues, setVlanSettingValues, vlanList, portsUsedByLag
  } = useContext(VlanPortsContext)

  const [portsModule1, setPortsModule1] = useState<PortsType[]>([])
  const [portsModule2, setPortsModule2] = useState<PortsType[]>([])
  const [portsModule3, setPortsModule3] = useState<PortsType[]>([])

  const [selectedItems1, setSelectedItems1] = useState<string[]>([])
  const [selectedItems2, setSelectedItems2] = useState<string[]>([])
  const [selectedItems3, setSelectedItems3] = useState<string[]>([])
  const [slot2, setSlot2] = useState<SwitchSlot>()
  const [slot3, setSlot3] = useState<SwitchSlot>()

  useEffect(() => {
    if(vlanSettingValues){
      const slot1Data = vlanSettingValues.switchFamilyModels?.slots
        .filter(item => item.slotNumber === 1)
      if(slot1Data && slot1Data[0] && slot1Data[0].portStatus!== undefined){
        const portModule1List1 = slot1Data[0].portStatus?.map(
          item => ({ label: item.portNumber.toString(),
            value: `1/1/${item.portNumber.toString()}` }))
        setPortsModule1(portModule1List1)
      }

      const slot2Data = vlanSettingValues.switchFamilyModels?.slots
        .filter(item => item.slotNumber === 2)
      if(slot2Data && slot2Data[0] && slot2Data[0].portStatus!== undefined){
        const portModule1List2 = slot2Data[0].portStatus?.map(
          item => ({ label: item.portNumber.toString(),
            value: `1/2/${item.portNumber.toString()}` }))
        setPortsModule2(portModule1List2)
        setSlot2(slot2Data[0])
      }

      const slot3Data = vlanSettingValues.switchFamilyModels?.slots
        .filter(item => item.slotNumber === 3)
      if(slot3Data && slot3Data[0] && slot3Data[0].portStatus!== undefined){
        const portModule1List3 = slot3Data[0].portStatus?.map(
          item => ({ label: item.portNumber.toString(),
            value: `1/3/${item.portNumber.toString()}` }))
        setPortsModule3(portModule1List3)
        setSlot3(slot3Data[0])
      }

      if(vlanSettingValues.switchFamilyModels?.untaggedPorts){
        const untaggedPorts = vlanSettingValues.switchFamilyModels?.untaggedPorts
          .toString().split(',').filter(item => item !== '')
        form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], untaggedPorts)

        setSelectedItems1(untaggedPorts.filter(item=> item.split('/')[1] === '1'))
        setSelectedItems2(untaggedPorts.filter(item=> item.split('/')[1] === '2'))
        setSelectedItems3(untaggedPorts.filter(item=> item.split('/')[1] === '3'))
      }else{
        form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], [])
        setSelectedItems1([])
        setSelectedItems2([])
        setSelectedItems3([])
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
        top: box.top + window.scrollY,
        left: box.left + window.scrollX
      }

      Array.from({ length: portsModule1.length }).forEach((_,i) => {
        const itemKey = `untagged_module1_${i}`
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

      Array.from({ length: portsModule2.length }).forEach((_,i) => {
        const itemKey = `untagged_module2_${i}`
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


      Array.from({ length: portsModule3.length }).forEach((_,i) => {
        const itemKey = `untagged_module3_${i}`
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

      tmpUntaggedSelectedItem = _.uniq(tmpUntaggedSelectedItem)
    },
    onSelectionEnd: () => {
      const selectedVlanPort = form.getFieldValue(['switchFamilyModels', 'untaggedPorts']) || []
      const vlanPorts = _.xor(selectedVlanPort,tmpUntaggedSelectedItem)

      setSelectedItems1(vlanPorts.filter(item=> item.split('/')[1] === '1'))
      setSelectedItems2(vlanPorts.filter(item=> item.split('/')[1] === '2'))
      setSelectedItems3(vlanPorts.filter(item=> item.split('/')[1] === '3'))
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

  const handleCheckboxGroupChange =
    (moduleName: string, checkedValues: string[], setValues: (arg0: string[]) => void) => {
      setValues(checkedValues)
      let selectedUntaggedPorts: string[] = []
      switch(moduleName){
        case 'module1':
          // eslint-disable-next-line max-len
          selectedUntaggedPorts = _.uniq([...selectedItems2, ...selectedItems3, ...checkedValues])
          break
        case 'module2':
          // eslint-disable-next-line max-len
          selectedUntaggedPorts = _.uniq([...selectedItems1, ...selectedItems3, ...checkedValues])
          break
        case 'module3':
          // eslint-disable-next-line max-len
          selectedUntaggedPorts = _.uniq([...selectedItems1, ...selectedItems2, ...checkedValues])
          break
      }

      form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], selectedUntaggedPorts)
      setVlanSettingValues({
        ...vlanSettingValues,
        switchFamilyModels: {
          id: vlanSettingValues.switchFamilyModels?.id,
          model: vlanSettingValues.switchFamilyModels?.model || '',
          slots: vlanSettingValues.switchFamilyModels?.slots || [],
          untaggedPorts: selectedUntaggedPorts,
          taggedPorts: vlanSettingValues.switchFamilyModels?.taggedPorts || []
        }
      })
    }

  const getDisabledPorts = (timeslot: string) => {
    // TODO: support switch level vlan
    // const vlanSelectedPorts = isSwitchLevel && vlanList
    //   ? vlanList.map((item: Vlan) => item.switchVlanPortModels?.filter((obj) => obj))
    //   : (vlanList ? vlanList.map(item => item.switchFamilyModels
    //     ?.filter(obj => obj.model === vlanSettingValues.switchFamilyModels?.model)) : []
    //   )

    const vlanSelectedPorts = vlanList ? vlanList.map(item => item.switchFamilyModels
      ?.filter(obj => obj.model === vlanSettingValues.switchFamilyModels?.model)) : []

    const portExists = vlanSelectedPorts.map(item => item?.map(
      obj => { return obj.untaggedPorts?.split(',').includes(timeslot)}))
      .some(item => item?.some(element => element === true))

    const taggedPorts =
      vlanSettingValues.switchFamilyModels?.taggedPorts?.toString().split(',') || []

    const disabledPorts
      = taggedPorts.includes(timeslot) || portsUsedByLag?.includes(timeslot) || portExists || false

    return disabledPorts
  }

  const getTooltip = (timeslot: string) => {
    const taggedPorts =
    vlanSettingValues.switchFamilyModels?.taggedPorts?.toString().split(',') || []

    // TODO: support switch level vlan
    // const untaggedModel = isSwitchLevel && vlanList
    //   ? vlanList.filter((item:Vlan) => item.switchVlanPortModels?.some((switchModel) =>
    //     switchModel.untaggedPorts?.split(',')?.includes(timeslot)))
    //   : (vlanList ?
    //     vlanList.filter(item => item.switchFamilyModels?.some(
    //       switchModel => switchModel.model === vlanSettingValues.switchFamilyModels?.model &&
    //     switchModel.untaggedPorts?.split(',')?.includes(timeslot))) : [])

    const untaggedModel = vlanList ?
      vlanList.filter(item => item.switchFamilyModels?.some(
        switchModel => switchModel.model === vlanSettingValues.switchFamilyModels?.model &&
        switchModel.untaggedPorts?.split(',').includes(timeslot))) : []

    const taggedModel = vlanList ?
      vlanList.filter(item => item.switchFamilyModels?.some(
        switchModel => switchModel.model === vlanSettingValues.switchFamilyModels?.model &&
        switchModel.taggedPorts?.split(',')?.includes(timeslot))) : []

    if(taggedPorts.includes(timeslot)){
      return <div>{$t({ defaultMessage: 'Port set as tagged' })}</div>
    } else if (portsUsedByLag?.includes(timeslot)) {
      return <div>{$t({ defaultMessage: 'Port used by LAG' })}</div>
    } else{
      return <div>
        <div>{$t({ defaultMessage: 'Networks on this port:' })}</div>
        <div>
          <UI.TagsOutlineIcon />
          <UI.PortSpan>
            {untaggedModel[0] ? untaggedModel[0].vlanId : '-'}
          </UI.PortSpan></div>
        <div>
          <UI.TagsSolidIcon />
          <UI.PortSpan>
            {taggedModel.length > 0 ? taggedModel.map(item => item.vlanId).join(',') : '-'}
          </UI.PortSpan>
        </div>
      </div>
    }
  }

  const getPortLabel = (port: number, slot: number) => {
    const model = vlanSettingValues.switchFamilyModels?.model || ''
    const portLabel = getSwitchPortLabel(model, slot) + port.toString()
    return portLabel
  }

  return (
    <div style={{ height: '300px' }}>
      <Row gutter={20}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>
            {$t({ defaultMessage:
                'Select the untagged ports (access ports) for this model ({family}-{model}):' },
            { family: vlanSettingValues.family, model: vlanSettingValues.model })}
          </label>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '20px' }} id='unTaggedContainer'>
        <Col>
          <Card type='solid-bg'>
            <Row gutter={20}>
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
                    key='checkboxGroup_module1'
                    className='lightblue'
                    onChange={(checkedValues) =>
                      handleCheckboxGroupChange('module1',
                        checkedValues as string[], setSelectedItems1)}
                    value={selectedItems1}
                    options={portsModule1.map((timeslot, i) => ({
                      label: <Tooltip
                        title={getTooltip(timeslot.value)}
                      >
                        <div
                          id={`untagged_module1_${i}`}
                          data-value={timeslot.value}
                          data-testid={`untagged_module1_${i}`}
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
              {vlanSettingValues.enableSlot2 && slot2 &&
              <Col>
                <Row gutter={20}>
                  <Col>
                    <div>
                      <Typography.Text style={{ fontWeight: 'bold' }}>
                        {$t({ defaultMessage: 'Module 2' })}
                      </Typography.Text>
                    </div>
                    <Typography.Paragraph>
                      {$t({ defaultMessage: '{module2}' },
                        { module2: slot2.slotPortInfo?.split('X').join(' X ') })}
                    </Typography.Paragraph>
                    <UI.Module>
                      <Checkbox.Group
                        key='checkboxGroup_module2'
                        className='lightblue'
                        onChange={(checkedValues) =>
                          handleCheckboxGroupChange('module2',
                                checkedValues as string[], setSelectedItems2)}
                        value={selectedItems2}
                        options={portsModule2.map((timeslot, i) => ({
                          label: <Tooltip
                            title={getTooltip(timeslot.value)}
                          >
                            <div
                              id={`untagged_module2_${i}`}
                              data-value={timeslot.value}
                              data-testid={`untagged_module2_${i}`}
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
              {vlanSettingValues.enableSlot3 && slot3 &&
              <Col>
                <div>
                  <Typography.Text style={{ fontWeight: 'bold' }}>
                    {$t({ defaultMessage: 'Module 3' })}
                  </Typography.Text>
                </div>
                <Typography.Paragraph>
                  {$t({ defaultMessage: '{module3}' },
                    { module3: slot3.slotPortInfo?.split('X').join(' X ') })}
                </Typography.Paragraph>
                <UI.Module>
                  <Checkbox.Group
                    key='checkboxGroup_module3'
                    className='lightblue'
                    onChange={(checkedValues) =>
                      handleCheckboxGroupChange('module3',
                            checkedValues as string[], setSelectedItems3)}
                    value={selectedItems3}
                    options={portsModule3.map((timeslot, i) => ({
                      label: <Tooltip
                        title={getTooltip(timeslot.value)}
                      >
                        <div
                          id={`untagged_module3_${i}`}
                          data-value={timeslot.value}
                          data-testid={`untagged_module3_${i}`}
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
          </Card>
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