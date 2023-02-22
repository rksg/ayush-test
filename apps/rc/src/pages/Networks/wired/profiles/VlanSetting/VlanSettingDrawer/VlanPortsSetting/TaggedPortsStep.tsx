
import { useState, useEffect, useContext } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import { Row, Col, Form, Typography, Checkbox } from 'antd'
import _                                        from 'lodash'

import { Card, Tooltip } from '@acx-ui/components'
import { SwitchSlot }    from '@acx-ui/rc/utils'
import { getIntl }       from '@acx-ui/utils'

import * as UI          from './styledComponents'
import VlanPortsContext from './VlanPortsContext'

export interface PortsType {
  label: string,
  value: string
}

export function TaggedPortsStep () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { vlanSettingValues, setVlanSettingValues } = useContext(VlanPortsContext)

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

      if(vlanSettingValues.switchFamilyModels?.taggedPorts){
        const taggedPorts = vlanSettingValues.switchFamilyModels?.taggedPorts
          .toString().split(',').filter(item => item !== '')
        form.setFieldValue(['switchFamilyModels', 'taggedPorts'], taggedPorts)

        setSelectedItems1(taggedPorts.filter(item=> item.split('/')[1] === '1'))
        setSelectedItems2(taggedPorts.filter(item=> item.split('/')[1] === '2'))
        setSelectedItems3(taggedPorts.filter(item=> item.split('/')[1] === '3'))
      }
    }
  }, [vlanSettingValues])

  let tmpTaggedSelectedItem: string[] = []
  const { DragSelection: DragSelectionTaggedPorts } = useSelectionContainer({
    eventsElement: document.getElementById('taggedContainer'),
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
      tmpTaggedSelectedItem = []
      const scrollAwareBox: Box = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX
      }

      Array.from({ length: portsModule1.length }, (_, i) => {
        const itemKey = `tagged_module1_${i}`
        const item = document.getElementById(itemKey)
        if(item){
          const { left, top, width, height } = item.getBoundingClientRect()
          const boxItem = { left, top, width, height }
          if (boxesIntersect(scrollAwareBox, boxItem)) {
            if(item.dataset.value !== undefined && item.dataset.disabled === 'false'){
              tmpTaggedSelectedItem.push(item.dataset.value)
            }
          }
        }
      })

      Array.from({ length: portsModule2.length }, (_, i) => {
        const itemKey = `tagged_module2_${i}`
        const item = document.getElementById(itemKey)
        if(item){
          const { left, top, width, height } = item.getBoundingClientRect()
          const boxItem = { left, top, width, height }
          if (boxesIntersect(scrollAwareBox, boxItem)) {
            if(item.dataset.value !== undefined && item.dataset.disabled === 'false'){
              tmpTaggedSelectedItem.push(item.dataset.value)
            }
          }
        }
      })


      Array.from({ length: portsModule3.length }, (_, i) => {
        const itemKey = `tagged_module3_${i}`
        const item = document.getElementById(itemKey)
        if(item){
          const { left, top, width, height } = item.getBoundingClientRect()
          const boxItem = { left, top, width, height }
          if (boxesIntersect(scrollAwareBox, boxItem)) {
            if(item.dataset.value !== undefined && item.dataset.disabled === 'false'){
              tmpTaggedSelectedItem.push(item.dataset.value)
            }
          }
        }
      })

      tmpTaggedSelectedItem = _.uniq(tmpTaggedSelectedItem)
    },
    onSelectionEnd: () => {
      const selectedVlanPort = form.getFieldValue(['switchFamilyModels', 'taggedPorts']) || []
      const vlanPorts = _.xor(selectedVlanPort,tmpTaggedSelectedItem)
      setSelectedItems1(vlanPorts.filter(item=> item.split('/')[1] === '1'))
      setSelectedItems2(vlanPorts.filter(item=> item.split('/')[1] === '2'))
      setSelectedItems3(vlanPorts.filter(item=> item.split('/')[1] === '3'))
      form.setFieldValue(['switchFamilyModels', 'taggedPorts'], vlanPorts)

      setVlanSettingValues({
        ...vlanSettingValues,
        switchFamilyModels: {
          id: vlanSettingValues.switchFamilyModels?.id,
          model: vlanSettingValues.switchFamilyModels?.model || '',
          slots: vlanSettingValues.switchFamilyModels?.slots || [],
          untaggedPorts: vlanSettingValues.switchFamilyModels?.untaggedPorts || [],
          taggedPorts: vlanPorts
        }
      })
      tmpTaggedSelectedItem = []
    },
    isEnabled: true
  })

  const handleCheckboxGroupChange =
    (moduleName: string, checkedValues: string[], setValues: (arg0: string[]) => void) => {
      setValues(checkedValues)
      let taggedValues: string[] = []
      switch(moduleName){
        case 'module1':
          taggedValues = _.uniq([...selectedItems2, ...selectedItems3, ...checkedValues])
          form.setFieldValue(['switchFamilyModels', 'taggedPorts'], taggedValues)

          setVlanSettingValues({
            ...vlanSettingValues,
            switchFamilyModels: {
              id: vlanSettingValues.switchFamilyModels?.id,
              model: vlanSettingValues.switchFamilyModels?.model || '',
              slots: vlanSettingValues.switchFamilyModels?.slots || [],
              untaggedPorts: vlanSettingValues.switchFamilyModels?.untaggedPorts || [],
              taggedPorts: taggedValues
            }
          })
          break
        case 'module2':
          taggedValues = _.uniq([...selectedItems1, ...selectedItems3, ...checkedValues])
          form.setFieldValue(['switchFamilyModels', 'taggedPorts'], taggedValues)

          setVlanSettingValues({
            ...vlanSettingValues,
            switchFamilyModels: {
              id: vlanSettingValues.switchFamilyModels?.id,
              model: vlanSettingValues.switchFamilyModels?.model || '',
              slots: vlanSettingValues.switchFamilyModels?.slots || [],
              untaggedPorts: vlanSettingValues.switchFamilyModels?.untaggedPorts || [],
              taggedPorts: taggedValues
            }
          })

          break
        case 'module3':
          taggedValues = _.uniq([...selectedItems1, ...selectedItems2, ...checkedValues])
          form.setFieldValue(['switchFamilyModels', 'taggedPorts'], taggedValues)

          setVlanSettingValues({
            ...vlanSettingValues,
            switchFamilyModels: {
              id: vlanSettingValues.switchFamilyModels?.id,
              model: vlanSettingValues.switchFamilyModels?.model || '',
              slots: vlanSettingValues.switchFamilyModels?.slots || [],
              untaggedPorts: vlanSettingValues.switchFamilyModels?.untaggedPorts || [],
              taggedPorts: taggedValues
            }
          })

          break
      }
    }

  return (
    <>
      <Row gutter={20}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>
            {$t({ defaultMessage:
                'Select the tagged ports (access ports) for this model ({family}-{model}):' },
            { family: vlanSettingValues.family, model: vlanSettingValues.model })}
          </label>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '20px' }} id='taggedContainer'>
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
                    className='purple'
                    onChange={(checkedValues) =>
                      handleCheckboxGroupChange('module1',
                        checkedValues as string[], setSelectedItems1)}
                    value={selectedItems1}
                    options={portsModule1.map((timeslot, i) => ({
                      label: <Tooltip
                        title={''}
                      >
                        <div
                          id={`tagged_module1_${i}`}
                          data-value={timeslot.value}
                          data-testid={`tagged_module1_${i}`}
                          data-disabled={vlanSettingValues.switchFamilyModels?.untaggedPorts
                            .includes(timeslot.value)}
                          style={{ width: '20px', height: '20px' }}
                        ></div>
                        <p>{i+1}</p>
                      </Tooltip>,
                      value: timeslot.value,
                      disabled: vlanSettingValues.switchFamilyModels?.untaggedPorts
                        .includes(timeslot.value)
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
                        className='purple'
                        onChange={(checkedValues) =>
                          handleCheckboxGroupChange('module2',
                                checkedValues as string[], setSelectedItems2)}
                        value={selectedItems2}
                        options={portsModule2.map((timeslot, i) => ({
                          label: <Tooltip
                            title={timeslot.value}
                          >
                            <div
                              id={`tagged_module2_${i}`}
                              data-value={timeslot.value}
                              data-testid={`tagged_module2_${i}`}
                              data-disabled={vlanSettingValues.switchFamilyModels?.untaggedPorts
                                .includes(timeslot.value)}
                              style={{ width: '20px', height: '20px' }}
                            ></div>
                            <p>{i+1}</p>
                          </Tooltip>,
                          value: timeslot.value,
                          disabled: vlanSettingValues.switchFamilyModels?.untaggedPorts
                            .includes(timeslot.value)
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
                    className='purple'
                    onChange={(checkedValues) =>
                      handleCheckboxGroupChange('module3',
                            checkedValues as string[], setSelectedItems3)}
                    value={selectedItems3}
                    options={portsModule3.map((timeslot, i) => ({
                      label: <Tooltip
                        title={''}
                      >
                        <div
                          id={`tagged_module3_${i}`}
                          data-value={timeslot.value}
                          data-testid={`tagged_module3_${i}`}
                          data-disabled={vlanSettingValues.switchFamilyModels?.untaggedPorts
                            .includes(timeslot.value)}
                          style={{ width: '20px', height: '20px' }}
                        ></div>
                        <p>{i+1}</p>
                      </Tooltip>,
                      value: timeslot.value,
                      disabled: vlanSettingValues.switchFamilyModels?.untaggedPorts
                        .includes(timeslot.value)
                    }))}
                  />
                </UI.Module>
              </Col>
              }
            </Row>
          </Card>
          <DragSelectionTaggedPorts />
        </Col>
      </Row>
      <Form.Item name={['switchFamilyModels', 'taggedPorts']} />
    </>
  )
}