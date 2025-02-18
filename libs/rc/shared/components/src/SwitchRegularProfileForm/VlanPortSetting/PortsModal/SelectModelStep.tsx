
import { useState, useEffect } from 'react'

import { Row, Col, Form, Radio, Typography, RadioChangeEvent, Checkbox, Select, Input } from 'antd'
import { CheckboxChangeEvent }                                                          from 'antd/lib/checkbox'
import { DefaultOptionType }                                                            from 'antd/lib/select'

import { Card, Tooltip, useStepFormContext }             from '@acx-ui/components'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { ICX_MODELS_MODULES, SwitchSlot2 as SwitchSlot } from '@acx-ui/rc/utils'
import { getIntl }                                       from '@acx-ui/utils'

import { checkIfModuleFixed, PortSetting, VlanPort } from '../index.utils'

import {
  getSlots,
  getModelModules
} from './PortsModal.utils'
import * as UI from './styledComponents'

export function SelectModelStep (props: {
  editMode: boolean
  editRecord?: VlanPort
  families: DefaultOptionType[]
}) {
  const { $t } = getIntl()
  const { families } = props
  const { form, editMode } = useStepFormContext()

  const [models, setModels] = useState<DefaultOptionType[]>([])
  const [modelModules, setModelModules] = useState<string[][]>()

  const [moduleSelectionEnable, setModuleSelectionEnable] = useState(false)
  const [module2SelectionEnable, setModule2SelectionEnable] = useState(true)
  const [optionList, setOptionList] = useState<DefaultOptionType[][]>([])

  const isSupport8200AV = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200AV)

  const data = form?.getFieldsValue(true)
  const [ enableSlot2, enableSlot3, slots ] = [
    // Form.useWatch('family', form),
    // Form.useWatch('model', form),
    Form.useWatch<boolean>('enableSlot2', form),
    Form.useWatch<boolean>('enableSlot3', form),
    Form.useWatch<SwitchSlot[]>('slots', form)
  ]

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('***************************** data: ', data)
    const { family, model } = data
    if (family && model) {
      const modelModules = getModelModules(family, model)
      const slotOptionLists = getSlots(family, model)
      setOptionList(slotOptionLists)
      setModelModules(modelModules)

      familyChangeAction(family)
      modelChangeAction(family, model)
    }
  }, [data?.family])

  const onFamilyChange = (e: RadioChangeEvent) => {
    form.resetFields([
      'model',
      'enableSlot2',
      'enableSlot3',
      'enableSlot4',
      'selectedOptionOfSlot2',
      'selectedOptionOfSlot3',
      'selectedOptionOfSlot4'
    ])
    // setFamily(e.target.value)
    familyChangeAction(e.target.value)
    form.setFieldValue('model', '')
    setModuleSelectionEnable(false)
  }

  const familyChangeAction = (family: string) => {
    if(editMode){
      setModuleSelectionEnable(false)
    }
    const index = family as keyof typeof ICX_MODELS_MODULES
    const modelsList = ICX_MODELS_MODULES[index]

    const modelsData = Object.keys(modelsList ?? {})?.map(key => {
      return { label: key, value: key }
    })
    const filterModels = (modelsData: { label: string; value: string }[]) => {
      if (!isSupport8200AV && index === 'ICX8200') {
        return modelsData.filter(model => model.value !== '24PV' && model.value !== 'C08PFV')
      }
      return modelsData
    }
    const filteredModels = filterModels(modelsData)
    setModels(filteredModels)
  }

  const onModelChange = (e: RadioChangeEvent) => {
    const family = form.getFieldValue('family')

    form.resetFields([
      'enableSlot2',
      'enableSlot3',
      'enableSlot4',
      'selectedOptionOfSlot2',
      'selectedOptionOfSlot3',
      'selectedOptionOfSlot4'
    ])

    form.setFieldValue('model', e.target.value)
    form.setFieldValue('selectedOptionOfSlot2', null) ///
    form.setFieldValue('selectedOptionOfSlot3', null)
    form.setFieldValue('slots', [])
    // form.setFieldValue('switchFamilyModels', {
    //   ...switchFamilyModels,
    //   model: `${family}-${model}`,
    //   slots: []
    // })

    // setEnableSlot2(false)
    // setEnableSlot3(false)
    // setEnableSlot4(false)
    setModuleSelectionEnable(true)
    setModule2SelectionEnable(true)
    // setModule3SelectionEnable(true)
    // setModel(e.target.value)
    modelChangeAction(family, e.target.value)


  }

  const modelChangeAction = (family: string, model: string) => {
    // console.log('modelChangeAction: ', family, model)
    if (!editMode) {
      setModuleSelectionEnable(true)
      setModule2SelectionEnable(true)
      // setModule3SelectionEnable(true)
    } else {
      setModuleSelectionEnable(true)
    }
    // checkIfModuleFixed(family, model)

    const values = form.getFieldsValue(true)
    const modelModules = getModelModules(family, model)
    const slotOptionLists = getSlots(family, model)
    setOptionList(slotOptionLists)
    setModelModules(modelModules)

    const {
      moduleSelectionEnable,
      module2SelectionEnable,
      enableSlot2,
      enableSlot3
      // selectedOptionOfSlot2,
      // selectedOptionOfSlot3
    } = checkIfModuleFixed(family, model)

    if (moduleSelectionEnable !== undefined) {
      setModuleSelectionEnable(moduleSelectionEnable)
    }
    if (module2SelectionEnable !== undefined) {
      setModule2SelectionEnable(module2SelectionEnable)
    }
    form.setFieldsValue({
      ...values,
      ...(enableSlot2 !== undefined ? { enableSlot2 } : {}),
      ...(enableSlot3 !== undefined ? { enableSlot3 } : {}),
      // ...(module2SelectionEnable ? { selectedOptionOfSlot2: slotOptionLists?.[0]?.[0].value, } : {}),
      // ...({ selectedOptionOfSlot3: slotOptionLists?.[1]?.[0].value } ),
      ...(!form.getFieldValue('enableSlot2') ? {
        selectedOptionOfSlot2: slotOptionLists?.[0]?.[0]?.value } : {}),
      ...(!form.getFieldValue('enableSlot3') ? {
        selectedOptionOfSlot3: slotOptionLists?.[1]?.[0]?.value } : {})
    })

    updateModelPortData(family, model)

    // const { slots, slotOptionLists } = getSlots(family, model)
    // setOptionList(slotOptionLists)
    // setSlots(slots)
    // setSwitchFamilyModels(
    //   { ...switchFamilyModels, slots: [] }
    // )

    // updateModelPortData(family, model)
  }

  const onCheckChange = function (e: CheckboxChangeEvent, slot: string) {
    if (!e.target.checked) {
      const { portSettings } = form.getFieldsValue(true)
      form.setFieldValue('portSettings', portSettings.filter((port: PortSetting) => {
        return !port.port.startsWith(`1/${slot}/`)
      }))
    }

    onModuleChange()
  }

  const onModuleChange = () => {
    form.setFieldValue('slots', [])
    updateModelPortData(form.getFieldValue('family'), form.getFieldValue('model'))
  }

  const updateModelPortData = (family: string, model: string) => {
    const modelModules = getModelModules(family, model)
    const moduleCount = modelModules?.length ?? 0

    // Array.from({ length: moduleCount }, (_, i) => {
    //   const slotNumber = i+1
    //   const enable = form.getFieldValue(`enableSlot${slotNumber}`)
    //   const index = slots?.findIndex(s => s.slotNumber === slotNumber) || -1
    //   if (!enable && index !== -1) {
    //     slots?.splice(index, 1)
    //   }
    //   generateSlotData(slotNumber, family, model)
    // })

    const newSlots = Array.from({ length: moduleCount }, (_, i) => {
      const slotNumber = i+1
      // const enable = form.getFieldValue(`enableSlot${slotNumber}`)
      // const index = slots?.findIndex(s => s.slotNumber === slotNumber) || -1
      // if (!enable && index !== -1) {
      //   slots?.splice(index, 1)
      // }
      return generateSlotData2(slotNumber, family, model)
    }).filter(Boolean)

    form.setFieldValue('slots', newSlots)
    // console.log('newSlots: ', newSlots)
  }

  // eslint-disable-next-line no-console
  console.log('slots: ', slots)
  // eslint-disable-next-line no-console
  console.log('modelModules: ', modelModules)

  const generateSlotData2 =(
    slotNumber: number,
    selectedFamily: string, selectedModel: string
  ) => {
    // const slots: SwitchSlot[] = form.getFieldValue('slots')
    const slotOptionLists = getSlots(selectedFamily, selectedModel)
    const optionList = slotNumber === 1 ? [] : slotOptionLists?.[slotNumber - 2] //TODO

    const isEnable = slotNumber === 1 ? true : form.getFieldValue(`enableSlot${slotNumber}`)
    const selectedOption = form.getFieldValue(`selectedOptionOfSlot${slotNumber}`)

    if (isEnable) {
      let totalPortNumber: string = '0'
      let slotPortInfo: string = ''
      const defaultOption = optionList[0]?.value
      const slotOption = optionList?.length > 1 && !selectedOption
        ? defaultOption : selectedOption

      if (optionList?.length > 1) {
        slotPortInfo = slotOption
        totalPortNumber = slotPortInfo.split('X', 1)[0]
      }
      if ((optionList?.length === 1 || totalPortNumber === '0') &&
      selectedFamily !== '' && selectedModel !== '') {
        const familyIndex = selectedFamily as keyof typeof ICX_MODELS_MODULES
        const familyList = ICX_MODELS_MODULES[familyIndex]
        const modelIndex = selectedModel as keyof typeof familyList
        slotPortInfo = slotOption || familyList[modelIndex][slotNumber - 1][0]
        totalPortNumber = slotPortInfo.split('X')[0]
      }

      // console.log('generateSlotData: ', slots, slotNumber, {
      //   slotNumber: slotNumber,
      //   enable: isEnable,
      //   option: slotOption,
      //   slotPortInfo: slotPortInfo,
      //   portStatus: generatePortData(totalPortNumber)
      // })

      return {
        slotNumber: slotNumber,
        enable: isEnable,
        option: slotOption,
        slotPortInfo: slotPortInfo,
        portStatus: generatePortData(totalPortNumber)
      }
    }
    return null
  }

  // const generateSlotData =(
  //   slotNumber: number,
  //   // slotEnable: boolean,
  //   //slotOptions: DefaultOptionType[],
  //   // slotOption: string,
  //   selectedFamily: string, selectedModel: string
  // ) => {
  //   const slots: SwitchSlot[] = form.getFieldValue('slots')
  //   const slotOptionLists = getSlots(selectedFamily, selectedModel)
  //   const optionList = slotNumber === 1 ? [] : slotOptionLists?.[slotNumber - 2] //TODO

  //   const isEnable = slotNumber === 1 ? true : form.getFieldValue(`enableSlot${slotNumber}`)
  //   const selectedOption = form.getFieldValue(`selectedOptionOfSlot${slotNumber}`)

  //   if (isEnable) {
  //     let totalPortNumber: string = '0'
  //     let slotPortInfo: string = ''
  //     const defaultOption = optionList[0]?.value
  //     const slotOption = optionList?.length > 1 && !selectedOption
  //       ? defaultOption : selectedOption

  //     if (optionList?.length > 1) {
  //       slotPortInfo = slotOption
  //       totalPortNumber = slotPortInfo.split('X', 1)[0]
  //     }
  //     if ((optionList?.length === 1 || totalPortNumber === '0') &&
  //     selectedFamily !== '' && selectedModel !== '') {
  //       const familyIndex = selectedFamily as keyof typeof ICX_MODELS_MODULES
  //       const familyList = ICX_MODELS_MODULES[familyIndex]
  //       const modelIndex = selectedModel as keyof typeof familyList
  //       slotPortInfo = slotOption || familyList[modelIndex][slotNumber - 1][0]
  //       totalPortNumber = slotPortInfo.split('X')[0]
  //     }

  //     const slotData = {
  //       slotNumber: slotNumber,
  //       enable: isEnable,
  //       option: slotOption,
  //       slotPortInfo: slotPortInfo,
  //       portStatus: generatePortData(totalPortNumber)
  //     }

  //     console.log('generateSlotData: ', slots, slotNumber, slotData)

  //     const index = slots.findIndex(slot => slot.slotNumber === slotNumber)
  //     if (index === -1) {
  //       slots.push(slotData)
  //     } else {
  //       if(slots){
  //         slots[index] = slotData
  //       }
  //     }

  //     form.setFieldValue('slots', slots?.sort((a, b) => {
  //       return a.slotNumber > b.slotNumber ? 1 : -1
  //     }))

  //   }
  // }

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
        <Col span={5}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Family' })}</Typography.Title>
          <UI.GroupListLayout>
            <Card>
              <Form.Item
                name='family'
                // required={true}
                // initialValue={data?.family || families?.[0].value}
                // rules={[{ required: true }]}
                children={
                  <Radio.Group
                  // defaultValue={data?.family || families?.[0]?.value}
                    onChange={onFamilyChange}
                  >
                    {families.map(({ label, value }) => (
                      <Radio key={value} value={value} disabled={editMode}>
                        <Tooltip
                          title={''}>
                          <div data-testid={value}>{label}</div>
                        </Tooltip>
                      </Radio>
                    ))}
                  </Radio.Group>
                }
              />
            </Card>
          </UI.GroupListLayout>
        </Col>
        <Col span={5}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Model' })}</Typography.Title>
          <UI.GroupListLayout>
            <Card>
              { <Form.Item
                name='model'
                required={true}
                initialValue={data?.model || models?.[0]?.value}
                children={
                  <Radio.Group
                  // defaultValue={data?.model || models?.[0]?.value}
                    onChange={onModelChange}
                  >
                    {models.map(({ label, value }) => (
                      <Radio key={value} value={value} disabled={editMode}>
                        <Tooltip
                          title={''}>
                          <div data-testid={value}>{label}</div>
                        </Tooltip>
                      </Radio>
                    ))}
                  </Radio.Group>
                }
              />}
            </Card>
          </UI.GroupListLayout>
        </Col>
        <Col span={9} flex={'400px'} hidden={!moduleSelectionEnable}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Select Modules' })}</Typography.Title>
          <Row style={{ paddingTop: '5px' }}
            hidden={!(modelModules && modelModules?.length > 1 && module2SelectionEnable)}>
            {/* TODO */}
            <Col span={optionList?.[0]?.length === 1 ? 24 : 7} >
              <Form.Item
                name='enableSlot2'
                initialValue={false}
                valuePropName='checked'
                children={
                  <Checkbox
                    data-testid='module2Checkbox'
                    onChange={(e)=>{ onCheckChange(e, '2') }}
                    // onChange={onModuleChange}
                  >
                    {$t({ defaultMessage: 'Module 2:' })}
                    {optionList?.[0]?.length===1 &&
                      ' ' + (optionList?.[0][0]?.value as string)?.split('X').join(' X ')}
                  </Checkbox>
                }
              />
            </Col>
            <Col span={10}>
              {optionList?.length && <Form.Item
                name='selectedOptionOfSlot2'
                // initialValue={'1'}
                // initialValue={optionList?.[0]?.[0]?.value}
                hidden={optionList?.[0]?.length===1}
              >
                <Select
                  defaultActiveFirstOption
                  options={optionList?.[0]}
                  disabled={!enableSlot2}
                  onChange={onModuleChange}
                />
              </Form.Item>}
            </Col>
          </Row>
          {/* <Row hidden={!(slots && slots?.length > 2 && module3SelectionEnable)}> */}
          <Row hidden={!(modelModules && modelModules?.length > 2)}>
            <Col span={optionList?.[1]?.length === 1 ? 24 : 7} >
              <Form.Item
                name='enableSlot3'
                initialValue={false}
                valuePropName='checked'
                children={
                  <Checkbox
                    data-testid='module3Checkbox'
                    onChange={(e)=>{ onCheckChange(e, '3') }}
                    // onChange={onModuleChange}
                  >
                    {$t({ defaultMessage: 'Module 3:' })}
                    {optionList?.[1]?.length===1 &&
                      ' ' + (optionList?.[1][0]?.value as string)?.split('X').join(' X ')}
                  </Checkbox>
                }
              />
            </Col>
            <Col span={10} >
              { optionList?.length && <Form.Item
                name='selectedOptionOfSlot3'
                hidden={optionList?.[1]?.length===1}
              >
                <Select
                  options={optionList?.[1]}
                  disabled={!enableSlot3}
                  onChange={onModuleChange}
                />
              </Form.Item>}
            </Col>
          </Row>
        </Col>
      </Row>

      <Form.Item
        name='slots'
        hidden={true}
        children={<Input />}
      />

    </>
  )
}