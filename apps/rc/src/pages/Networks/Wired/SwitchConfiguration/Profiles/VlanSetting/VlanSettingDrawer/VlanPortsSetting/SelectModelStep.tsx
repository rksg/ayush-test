
import { useState, useEffect, SetStateAction } from 'react'

import { Row, Col, Form, Input, Radio, Typography, RadioChangeEvent, Checkbox, Select } from 'antd'
import { CheckboxChangeEvent }                                                          from 'antd/lib/checkbox'

import { Card, StepsForm, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { ICX_MODELS_MODULES }       from '@acx-ui/rc/utils'
import { getIntl }                  from '@acx-ui/utils'

import * as UI from './styledComponents'

export interface ModelsType {
  label: string,
  value: string
}

export function SelectModelStep () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
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

  const switchSupportIcx8200FF = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200)

  useEffect(() => {
    if(ICX_MODELS_MODULES){
      const familiesData = Object.keys(ICX_MODELS_MODULES).filter(key=> {
        return !switchSupportIcx8200FF && key !== 'ICX8200'
      }).map(key => {
        return { label: `ICX-${key.split('ICX')[1]}`, value: key }
      })
      setFamilies(familiesData)
    }
  }, [ICX_MODELS_MODULES])

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
    console.log(slots)
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
    form.resetFields(['model', 'enableSlot2', 'enableSlot3', 'enableSlot4'])
    setModuleSelectionEnable(false)
    setFamily(e.target.value)
    const index = e.target.value as keyof typeof ICX_MODELS_MODULES
    const modelsList = ICX_MODELS_MODULES[index]

    const modelsData = Object.keys(modelsList).map(key => {
      return { label: key, value: key }
    })
    setModels(modelsData)
  }

  const onModelChange = (e: RadioChangeEvent) => {
    setEnableSlot2(false)
    setEnableSlot3(false)
    setEnableSlot4(false)
    setModuleSelectionEnable(true)
    setModule2SelectionEnable(true)
    setModule3SelectionEnable(true)
    setModel(e.target.value)
    checkIfModuleFixed(family, e.target.value)
    getSlots(family, e.target.value)
  }

  const onCheckChange = function (e: CheckboxChangeEvent, slot: string) {
    switch(slot){
      case 'slot2':
        setEnableSlot2(e.target.checked)
        break
      case 'slot3':
        setEnableSlot3(e.target.checked)
        break
      case 'slot4':
        setEnableSlot4(e.target.checked)
        break
    }
  }

  return (
    <>
      <Row gutter={20}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>
            {$t({ defaultMessage: 'Select family and model to be configured:' })}
          </label>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '20px' }}>
        <Col span={4}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Family' })}</Typography.Title>
          <UI.GroupListLayout>
            <Card>
              <Form.Item
                name={'family'}
                children={<Radio.Group onChange={onFamilyChange}>
                  {families.map(({ label, value }) => (
                    <Radio key={value} value={value}>
                      <Tooltip
                        title={''}>
                        {label}
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
                children={<Radio.Group onChange={onModelChange}>
                  {models.map(({ label, value }) => (
                    <Radio key={value} value={value}>
                      <Tooltip
                        title={''}>
                        {label}
                      </Tooltip>
                    </Radio>
                  ))}
                </Radio.Group>}
              />
            </Card>
          </UI.GroupListLayout>
        </Col>
        <Col span={6} flex={'400px'} hidden={!moduleSelectionEnable}>
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
              >
                <Select
                  options={optionListForSlot2}
                  disabled={!enableSlot2}
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
              >
                <Select
                  options={optionListForSlot3}
                  disabled={!enableSlot3}
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
              >
                <Select
                  options={optionListForSlot4}
                  disabled={!enableSlot4}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}