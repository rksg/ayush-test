
import { useState, useEffect, SetStateAction } from 'react'

import { Row, Col, Form, Radio, Typography, RadioChangeEvent, Checkbox, Select, Input } from 'antd'
import { CheckboxChangeEvent }                                                          from 'antd/lib/checkbox'

import { Card, Tooltip }                                        from '@acx-ui/components'
import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { ICX_MODELS_MODULES, TrustedPort, TrustedPortTypeEnum } from '@acx-ui/rc/utils'
import { getIntl }                                              from '@acx-ui/utils'

import * as UI from './styledComponents'

export interface ModelsType {
  label: string
  value: string
}

export interface PortsType {
  slotNumber: number,
  portNumber: number
  portTagged: string
}

export function SelectModelStep (props: { editRecord?: TrustedPort }) {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { editRecord } = props
  const [families, setFamilies] = useState<ModelsType[]>([])
  const [models, setModels] = useState<ModelsType[]>([])
  const [family, setFamily] = useState('')
  const [model, setModel] = useState('')
  const [slots, setSlots] = useState<string[][]>()

  const [moduleSelectionEnable, setModuleSelectionEnable] = useState(false)
  const [module2SelectionEnable, setModule2SelectionEnable] = useState(true)
  const [module3SelectionEnable, setModule3SelectionEnable] = useState(true)

  const [enableSlot2, setEnableSlot2] = useState(false)
  const [enableSlot3, setEnableSlot3] = useState(false)
  const [enableSlot4, setEnableSlot4] = useState(false)

  const [optionListForSlot2, setOptionListForSlot2] = useState<ModelsType[]>([])
  const [optionListForSlot3, setOptionListForSlot3] = useState<ModelsType[]>([])
  const [optionListForSlot4, setOptionListForSlot4] = useState<ModelsType[]>([])

  const [trustedPorts, setTrustedPorts] =
    useState<TrustedPort>({
      id: '',
      model: '',
      trustPorts: [],
      slots: [],
      trustedPortType: TrustedPortTypeEnum.ALL
    })
  const switchSupportIcx8200FF = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200)

  useEffect(() => {
    if(ICX_MODELS_MODULES){
      const modules = switchSupportIcx8200FF ? Object.keys(ICX_MODELS_MODULES)
        : Object.keys(ICX_MODELS_MODULES).filter(key=> key !== 'ICX8200')
      const familiesData = modules.map(key => {
        return { label: `ICX-${key.split('ICX')[1]}`, value: key }
      })
      setFamilies(familiesData)
    }
    if(editRecord){
      const selectedFamily = editRecord.model.split('-')[0]
      const selectedModel = editRecord.model.split('-')[1]
      const selectedEnable2 = editRecord.slots.filter(item => item.slotNumber === 2)[0] || {}
      const selectedEnable3 = editRecord.slots.filter(item => item.slotNumber === 3)[0] || {}
      const selectedEnable4 = editRecord.slots.filter(item => item.slotNumber === 4)[0] || {}
      form.setFieldsValue({
        family: selectedFamily,
        model: selectedModel,
        enableSlot2: selectedEnable2.enable,
        enableSlot3: selectedEnable3.enable,
        enableSlot4: selectedEnable4.enable,
        selectedOptionOfSlot2: selectedEnable2.option,
        selectedOptionOfSlot3: selectedEnable3.option,
        selectedOptionOfSlot4: selectedEnable4.option,
        trustedPorts: editRecord
      })
      setFamily(selectedFamily)
      setModel(selectedModel)
      familyChangeAction(selectedFamily)
      modelChangeAction(selectedFamily, selectedModel)
      setEnableSlot2(selectedEnable2.enable)
      setEnableSlot3(selectedEnable3.enable)
      setEnableSlot4(selectedEnable4.enable)
      checkIfModuleFixed(selectedFamily, selectedModel)
      setTrustedPorts(editRecord)
    }else if(form.getFieldsValue()){
      const {
        family,
        model,
        enableSlot2,
        enableSlot3,
        enableSlot4
      } = form.getFieldsValue()
      if(family !== ''){
        setFamily(family)
        familyChangeAction(family)
      }
      if(model !== ''){
        setModel(model)
      }
      if(family !== '' && model !== ''){
        setEnableSlot2(enableSlot2)
        setEnableSlot3(enableSlot3)
        setEnableSlot4(enableSlot4)
        modelChangeAction(family, model)
        checkIfModuleFixed(family, model)
      }
    }
  }, [])

  const checkIfModuleFixed = (family: string, model: string) => {
    if (family === 'ICX7550') {
      setModuleSelectionEnable(true)
      form.setFieldValue('enableSlot2', true)
      form.setFieldValue('selectedOptionOfSlot2', optionListForSlot2[0]?.value)
      setModule2SelectionEnable(false)
    }

    if (family === 'ICX7150' || family === 'ICX7850') {
      switch (model) {
        case '24':
        case '24P':
        case '24F':
        case 'C10ZP':
        case 'C12P':
        case '48':
        case '48P':
        case '48PF':
        case '32Q':
          setModuleSelectionEnable(false)
          form.setFieldValue('enableSlot2', true)
          form.setFieldValue('enableSlot3', true)
          form.setFieldValue('selectedOptionOfSlot2', optionListForSlot2[0]?.value)
          form.setFieldValue('selectedOptionOfSlot3', optionListForSlot3[0]?.value)
          break

        case 'C08P':
        case 'C08PT':
        case '48ZP':
        case '48FS':
        case '48F':
          setModuleSelectionEnable(false)
          form.setFieldValue('enableSlot2', true)
          form.setFieldValue('selectedOptionOfSlot2', optionListForSlot2[0]?.value)
          break

        default:
          setModuleSelectionEnable(true)
          break
      }
    }
  }

  const getSlots = (selectedFamily: string, selectedModel: string) => {
    const familyIndex = selectedFamily as keyof typeof ICX_MODELS_MODULES

    const familyList = ICX_MODELS_MODULES[familyIndex]
    const modelIndex = selectedModel as keyof typeof familyList

    const slots = familyList[modelIndex]
    setSlots(slots)
    setSlotOptionList(slots, 1, setOptionListForSlot2)
    setSlotOptionList(slots, 2, setOptionListForSlot3)
    setSlotOptionList(slots, 3, setOptionListForSlot4)
  }

  const setSlotOptionList = (
    slots: string[][],
    slotIndex: number,
    setSlotOptionsList: { (value: SetStateAction<ModelsType[]>): void }) =>{
    const slotOptions: ModelsType[] = []
    if (slots.length > slotIndex) {
      for (let value of slots[slotIndex]) {
        const name = value.toString().split('X').join(' X ')
        slotOptions.push({ label: name, value: value.toString() })
      }
      setSlotOptionsList(slotOptions)
    }
  }

  const onFamilyChange = (e: RadioChangeEvent) => {
    setFamily(e.target.value)
    familyChangeAction(e.target.value)
    setModel('')
    form.setFieldValue('model', '')
    form.resetFields(['enableSlot2', 'enableSlot3', 'enableSlot4'])
    setModuleSelectionEnable(false)
  }

  const familyChangeAction = (family: string) => {
    const index = family as keyof typeof ICX_MODELS_MODULES
    const modelsList = ICX_MODELS_MODULES[index]

    const modelsData = Object.keys(modelsList).map(key => {
      return { label: key, value: key }
    })
    setModels(modelsData)
  }

  const onModelChange = (e: RadioChangeEvent) => {
    setModel(e.target.value)
    modelChangeAction(family, e.target.value)
    form.resetFields(['enableSlot2', 'enableSlot3', 'enableSlot4'])
    setEnableSlot2(false)
    setEnableSlot3(false)
    setEnableSlot4(false)
  }

  const modelChangeAction = (family: string, model: string) => {
    if(!editRecord){
      setModuleSelectionEnable(true)
      setModule2SelectionEnable(true)
      setModule3SelectionEnable(true)
    } else {
      setModuleSelectionEnable(true)
    }
    checkIfModuleFixed(family, model)
    getSlots(family, model)
    setTrustedPorts({ ...trustedPorts, slots: [] })
    updateModelPortData(family, model)
  }

  const onCheckChange = function (e: CheckboxChangeEvent, slot: string) {
    switch(slot){
      case 'slot2':
        setEnableSlot2(e.target.checked)
        form.setFieldValue('enableSlot2', e.target.checked)
        form.setFieldValue('selectedOptionOfSlot2', optionListForSlot2[0]?.value)
        break
      case 'slot3':
        setEnableSlot3(e.target.checked)
        form.setFieldValue('enableSlot3', e.target.checked)
        form.setFieldValue('selectedOptionOfSlot3', optionListForSlot3[0]?.value)
        break
      case 'slot4':
        setEnableSlot4(e.target.checked)
        form.setFieldValue('enableSlot4', e.target.checked)
        form.setFieldValue('selectedOptionOfSlot4', optionListForSlot4[0]?.value)
        break
    }
    onModuleChange()
  }

  const onModuleChange = () => {
    getSlots(form.getFieldValue('family'), form.getFieldValue('model'))
    setTrustedPorts({ ...trustedPorts, slots: [] })
    updateModelPortData(form.getFieldValue('family'), form.getFieldValue('model'))
  }

  const updateModelPortData = (selectedFamily: string, selectedModel: string) => {
    for (let slotNumber = 1; slotNumber <= 4; slotNumber++) {
      updateSlotPortData(slotNumber, selectedFamily, selectedModel)
    }
  }

  const updateSlotPortData =
  (slotNumber: number, selectedFamily: string, selectedModel: string) => {
    if (slotNumber === 1) {
      generateSlotData(slotNumber, true, [], '', selectedFamily, selectedModel)
    } else {
      const enable = form.getFieldValue(`enableSlot${slotNumber}`)
      let option = form.getFieldValue(`selectedOptionOfSlot${slotNumber}`)
      let optionList = optionListForSlot2
      switch (slotNumber) {
        case 3:
          optionList = optionListForSlot3
          break
        case 4:
          optionList = optionListForSlot4
          break
      }

      if (!enable) {
        option = ''
      }
      else if (enable && !option) {
        option = optionList[0] ? optionList[0].value : option
      }

      const index = trustedPorts?.slots?.findIndex(s => s.slotNumber === slotNumber) || -1
      if (!enable && index !== -1) {
        trustedPorts?.slots?.splice(index, 1)
      }
      generateSlotData(slotNumber, enable, optionList, option, selectedFamily, selectedModel)
    }
  }

  const generateSlotData =
  (slotNumber: number, slotEnable: boolean, slotOptions: ModelsType[],
    slotOption: string, selectedFamily: string, selectedModel: string) => {
    if (slotEnable) {
      let totalPortNumber: string = '0'
      let slotPortInfo: string = ''

      if (slotOptions.length > 1) {
        if (slotOption === '' || slotOption === undefined) {
          slotOption = slotOptions[0].value
        }
        slotPortInfo = slotOption
        totalPortNumber = slotPortInfo.split('X', 1)[0]
      }
      if ((slotOptions.length === 1 || totalPortNumber === '0') &&
      selectedFamily !== '' && selectedModel !== '') {
        const familyIndex = selectedFamily as keyof typeof ICX_MODELS_MODULES
        const familyList = ICX_MODELS_MODULES[familyIndex]
        const modelIndex = selectedModel as keyof typeof familyList
        slotPortInfo = slotOption || familyList[modelIndex][slotNumber - 1][0]
        totalPortNumber = slotPortInfo.split('X')[0]
      }

      const slotData = {
        slotNumber: slotNumber,
        enable: slotEnable,
        option: slotOption,
        slotPortInfo: slotPortInfo,
        portStatus: generatePortData(totalPortNumber)
      }

      const slotIndex = trustedPorts.slots?.findIndex(
        (s: { slotNumber: number }) => s.slotNumber === slotNumber)

      const tmpModelPortData = { ...trustedPorts }
      if (slotIndex === -1) {
        tmpModelPortData.slots.push(slotData)
        tmpModelPortData.model = form.getFieldValue('family') + '-' + form.getFieldValue('model')
        form.setFieldValue('switchFamilyModels', tmpModelPortData)
      } else {
        if(trustedPorts.slots[slotIndex].portStatus !== undefined){
          tmpModelPortData.slots[slotIndex] = slotData
          if(tmpModelPortData.slots && tmpModelPortData.slots.length > 0){
            tmpModelPortData.slots = tmpModelPortData.slots && tmpModelPortData.slots.sort(
              function (a: { slotNumber: number }, b: { slotNumber: number }) {
                return a.slotNumber > b.slotNumber ? 1 : -1
              })
          }
          tmpModelPortData.model = form.getFieldValue('family') + '-' + form.getFieldValue('model')
          form.setFieldValue('switchFamilyModels', tmpModelPortData)
        }
      }
    }
  }

  const generatePortData = (totalNumber: string) => {
    let ports = []
    for (let i = 1; i <= Number(totalNumber); i++) {
      let port = { portNumber: i, portTagged: '' }
      ports.push(port)
    }
    return ports
  }

  return (
    <>
      <Row gutter={20} style={{ marginTop: '20px' }}>
        <Col span={4}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Family' })}</Typography.Title>
          <UI.GroupListLayout>
            <Card>
              <Form.Item
                name={'family'}
                required={true}
                initialValue={family}
                children={<Radio.Group
                  onChange={onFamilyChange}
                >
                  {families.map(({ label, value }) => (
                    <Radio key={value} value={value} disabled={!!editRecord}>
                      <Tooltip
                        title={''}>
                        <div data-testid={value}>{label}</div>
                      </Tooltip>
                    </Radio>
                  ))}
                </Radio.Group>}
              />
            </Card>
          </UI.GroupListLayout>
        </Col>
        <Col span={4}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Model' })}</Typography.Title>
          <UI.GroupListLayout>
            <Card>
              <Form.Item
                name={'model'}
                required={true}
                initialValue={model}
                children={<Radio.Group
                  onChange={onModelChange}
                >
                  {models.map(({ label, value }) => (
                    <Radio key={value} value={value} disabled={!!editRecord}>
                      <Tooltip
                        title={''}>
                        <div data-testid={value}>{label}</div>
                      </Tooltip>
                    </Radio>
                  ))}
                </Radio.Group>}
              />
            </Card>
          </UI.GroupListLayout>
        </Col>
        <Col span={6} flex={'400px'} hidden={!moduleSelectionEnable || editRecord !== undefined}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Select Modules' })}</Typography.Title>
          <Row style={{ paddingTop: '5px' }}
            hidden={!(slots && slots?.length > 1 && module2SelectionEnable)}>
            <Col span={8} >
              <Form.Item
                name={'enableSlot2'}
                initialValue={false}
                valuePropName='checked'
                children={
                  <Checkbox
                    children={$t({ defaultMessage: 'Module 2' })}
                    onChange={(e)=>{ onCheckChange(e, 'slot2') }}
                  />
                }
              />
            </Col>
            <Col span={16} >
              <Form.Item
                name={'selectedOptionOfSlot2'}
                initialValue={optionListForSlot2[0]?.value}
              >
                <Select
                  options={optionListForSlot2}
                  disabled={!enableSlot2}
                  onChange={onModuleChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row hidden={!(slots && slots?.length > 2 && module3SelectionEnable)}>
            <Col span={8} >
              <Form.Item
                name={'enableSlot3'}
                initialValue={false}
                valuePropName='checked'
                children={
                  <Checkbox
                    children={$t({ defaultMessage: 'Module 3' })}
                    onChange={(e)=>{ onCheckChange(e, 'slot3') }}
                  />
                }
              />
            </Col>
            <Col span={16} >
              <Form.Item
                name={'selectedOptionOfSlot3'}
                initialValue={optionListForSlot3[0]?.value}
              >
                <Select
                  options={optionListForSlot3}
                  disabled={!enableSlot3}
                  onChange={onModuleChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row hidden={!(slots && slots?.length > 3)}>
            <Col span={8} >
              <Form.Item
                name={'enableSlot4'}
                initialValue={false}
                valuePropName='checked'
                children={
                  <Checkbox
                    children={$t({ defaultMessage: 'Module 4' })}
                    onChange={(e)=>{ onCheckChange(e, 'slot4') }}
                  />
                }
              />
            </Col>
            <Col span={16} >
              <Form.Item
                name={'selectedOptionOfSlot4'}
                initialValue={optionListForSlot4[0]?.value}
              >
                <Select
                  options={optionListForSlot4}
                  disabled={!enableSlot4}
                  onChange={onModuleChange}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Form.Item
        name={'switchFamilyModels'}
        hidden={true}
        children={<Input />}
      />
    </>
  )
}
