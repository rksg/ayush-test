
import { useState, useEffect } from 'react'

import { Row, Col, Form, Radio, Typography, RadioChangeEvent, Checkbox, Select, Input } from 'antd'
import { CheckboxChangeEvent }                                                          from 'antd/lib/checkbox'
import { DefaultOptionType }                                                            from 'antd/lib/select'

import { Card, Tooltip, useStepFormContext } from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { ICX_MODELS_MODULES }                from '@acx-ui/rc/utils'
import { getIntl }                           from '@acx-ui/utils'

import { VlanPort } from '..'

import * as UI from './styledComponents'
// import VlanPortsContext from './VlanPortsContext'
import { getSlots, checkIfModuleFixed as checkIfModuleFixedTemp } from './VlanPortSetting.utils'
// import { set } from 'lodash'

// export interface ModelsType {
//   label: string
//   value: string
// }

// export interface PortsType {
//   slotNumber: number,
//   portNumber: number
//   portTagged: string
// }

export function SelectModelStep (props: {
  editMode: boolean
  editRecord?: VlanPort
  families: DefaultOptionType[]
}) {
  const { $t } = getIntl()
  // const form = Form.useFormInstance()
  // const { vlanSettingValues } = useContext(VlanPortsContext)

  const { form, editMode } = useStepFormContext()
  const { families } = props // editRecord,

  // const [families, setFamilies] = useState<ModelsType[]>([])
  const [models, setModels] = useState<DefaultOptionType[]>([])
  // const [family, setFamily] = useState('')
  // const [model, setModel] = useState('')
  const [slots, setSlots] = useState<string[][]>()

  const [moduleSelectionEnable, setModuleSelectionEnable] = useState(false)
  const [module2SelectionEnable, setModule2SelectionEnable] = useState(true)
  // const [module3SelectionEnable, setModule3SelectionEnable] = useState(true)

  // const [enableSlot2, setEnableSlot2] = useState(false)
  // const [enableSlot3, setEnableSlot3] = useState(false)
  // const [enableSlot4, setEnableSlot4] = useState(false)

  // const [optionListForSlot2, setOptionListForSlot2] = useState<DefaultOptionType[]>([])
  // const [optionListForSlot3, setOptionListForSlot3] = useState<DefaultOptionType[]>([])
  // const [optionListForSlot4, setOptionListForSlot4] = useState<DefaultOptionType[]>([])

  const [optionList, setOptionList] = useState<DefaultOptionType[][]>([])


  const isSupport8200AV = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200AV)
  // const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)

  const data = form?.getFieldsValue(true)
  const [
    //family,
    model, enableSlot2temp, enableSlot3temp, switchFamilyModels] = [
    // Form.useWatch('family', form),
    Form.useWatch('model', form),
    Form.useWatch<boolean>('enableSlot2', form),
    Form.useWatch<boolean>('enableSlot3', form),
    Form.useWatch('switchFamilyModels', form)
  ]

  // const [family, model] = editRecord?.familymodel?.split('-') ?? []

  // const [switchFamilyModels, setSwitchFamilyModels] =
  //   useState<SwitchModelPortData>({
  //     id: '',
  //     model: '',
  //     slots: [],
  //     taggedPorts: [],
  //     untaggedPorts: []
  //   })

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('***************************** data: ', data)
    const { family, model } = data
    // if (family && model) {
    //   form.setFieldsValue({
    //     family,
    //     model
    //   })
    // }
    // if(ICX_MODELS_MODULES){
    //   const modules = Object.keys(ICX_MODELS_MODULES)
    //     .filter(key => isSupport8100 || key !== 'ICX8100')
    //   const familiesData = modules.map(key => {
    //     return { label: `ICX-${key.split('ICX')[1]}`, value: key }
    //   })
    //   console.log('familiesData: ', familiesData)
    //   setFamilies(familiesData)
    // }
    if(family && model) { //ICX_MODELS_MODULES &&
      // const selectedFamily = vlanSettingValues.family
      // const selectedModel = vlanSettingValues.model
      // const slots = vlanSettingValues.switchFamilyModels?.slots
      // const slots = editRecord?.slots

      const { slots, slotOptionLists } = getSlots(family, model)
      setOptionList(slotOptionLists)
      setSlots(slots)

      // form.setFieldsValue({
      //   ...data,
      //   selectedOptionOfSlot3: data.selectedOptionOfSlot3 || slotOptionLists?.[1]?.[0]?.value,
      // })
      // setSwitchFamilyModels({
      //   ...switchFamilyModels,
      //   model: `${family}-${model}`,
      //   slots
      // })

      // const selectedEnable2 = slots?.filter(item => item.slotNumber === 2)[0] ||
      //   { enable: false, option: '' }
      // const selectedEnable3 = slots?.filter(item => item.slotNumber === 3)[0] ||
      //   { enable: false, option: '' }
      // const selectedEnable4 = slots?.filter(item => item.slotNumber === 4)[0] ||
      //   { enable: false, option: '' }


      // form.setFieldsValue({
      //   // family: selectedFamily,
      //   // model: selectedModel,
      //   enableSlot2: selectedEnable2.enable,
      //   enableSlot3: selectedEnable3.enable,
      //   enableSlot4: selectedEnable4.enable,
      //   selectedOptionOfSlot2: selectedEnable2.option || slotOptionLists?.[0]?.[0].value,
      //   selectedOptionOfSlot3: selectedEnable3.option || slotOptionLists?.[1]?.[0].value,
      //   selectedOptionOfSlot4: selectedEnable4.option
      // })

      // setFamily(selectedFamily)
      // setModel(selectedModel)
      familyChangeAction(family)
      modelChangeAction(family, model)
      // setEnableSlot2(selectedEnable2.enable)
      // setEnableSlot3(selectedEnable3.enable)
      // setEnableSlot4(selectedEnable4.enable)
    }
  }, [data?.family])

  // useEffect(() => {
  //   if (switchFamilyModels && family && model) {
  //     console.log(switchFamilyModels)
  //     updateModelPortData(family, model)
  //   }
  // }, [switchFamilyModels])

  // useEffect(() => {
  //   const family = form.getFieldValue('family')
  //   const model = form.getFieldValue('model')
  //   const { slots } = switchFamilyModels
  //   const module = getPortsModule(slots, false)
  //   if(module?.[0]?.[0]?.length){
  //     const defaultModuleOptions = getModuleOptionsTemp(module[0][0] as unknown as PortsType[], 1, 1, `${family}-${model}`, [], [], [], [])
  //     console.log('defaultModuleOption: ', defaultModuleOptions)
  //     form.setFieldValue('defaultModuleOptions', defaultModuleOptions)
  //   }
  // }, [switchFamilyModels])

  // useEffect(() => {
  //   if(ICX_MODELS_MODULES){
  //     const modules = Object.keys(ICX_MODELS_MODULES)
  //       .filter(key => isSupport8100 || key !== 'ICX8100')
  //     const familiesData = modules.map(key => {
  //       return { label: `ICX-${key.split('ICX')[1]}`, value: key }
  //     })
  //     setFamilies(familiesData)
  //   }
  //   if(ICX_MODELS_MODULES && vlanSettingValues.family && vlanSettingValues.model){
  //     const selectedFamily = vlanSettingValues.family
  //     const selectedModel = vlanSettingValues.model
  //     const slots = vlanSettingValues.switchFamilyModels?.slots
  //     const selectedEnable2 = slots?.filter(
  //       (item: { slotNumber: number }) => item.slotNumber === 2)[0] ||
  //       { enable: false, option: '' }
  //     const selectedEnable3 = slots?.filter(
  //       (item: { slotNumber: number }) => item.slotNumber === 3)[0] ||
  //       { enable: false, option: '' }
  //     const selectedEnable4 = slots?.filter(
  //       (item: { slotNumber: number }) => item.slotNumber === 4)[0] ||
  //       { enable: false, option: '' }
  //     form.setFieldsValue({
  //       family: selectedFamily,
  //       model: selectedModel,
  //       enableSlot2: selectedEnable2.enable,
  //       enableSlot3: selectedEnable3.enable,
  //       enableSlot4: selectedEnable4.enable,
  //       selectedOptionOfSlot2: selectedEnable2.option,
  //       selectedOptionOfSlot3: selectedEnable3.option,
  //       selectedOptionOfSlot4: selectedEnable4.option
  //     })
  //     setFamily(selectedFamily)
  //     setModel(selectedModel)
  //     familyChangeAction(selectedFamily)
  //     modelChangeAction(selectedFamily, selectedModel)
  //     setEnableSlot2(selectedEnable2.enable)
  //     setEnableSlot3(selectedEnable3.enable)
  //     setEnableSlot4(selectedEnable4.enable)
  //   }
  // }, [vlanSettingValues])

  // const checkIfModuleFixed = (family: string, model: string) => {
  //   const { slots, slotOptionLists } = getSlots(family, model) ////
  //   const optionList = slotOptionLists

  //   if (family === 'ICX7550') {
  //     setModuleSelectionEnable(true)
  //     form.setFieldValue('enableSlot2', true)
  //     form.setFieldValue('selectedOptionOfSlot2', optionList?.[0]?.[0]?.value)
  //     setModule2SelectionEnable(false)
  //   }

  //   if (family === 'ICX8200') {
  //     setModuleSelectionEnable(false)
  //     form.setFieldValue('enableSlot2', true)
  //     form.setFieldValue('selectedOptionOfSlot2', optionList?.[0]?.[0]?.value)
  //     setModule2SelectionEnable(false)
  //   }

  //   if (family === 'ICX8100') {
  //     setModuleSelectionEnable(false)
  //     form.setFieldValue('enableSlot2', true)
  //     form.setFieldValue('selectedOptionOfSlot2', optionList?.[0]?.[0]?.value)
  //     setModule2SelectionEnable(false)
  //   }

  //   if (family === 'ICX7150' || family === 'ICX7850') {
  //     switch (model) {
  //       case '24':
  //       case '24P':
  //       case '24F':
  //       case 'C10ZP':
  //       case 'C12P':
  //       case '48':
  //       case '48P':
  //       case '48PF':
  //       case '32Q':
  //         setModuleSelectionEnable(false)
  //         form.setFieldValue('enableSlot2', true)
  //         form.setFieldValue('enableSlot3', true)
  //         form.setFieldValue('selectedOptionOfSlot2', optionList?.[0]?.[0]?.value)
  //         form.setFieldValue('selectedOptionOfSlot3', optionList?.[1]?.[0]?.value)
  //         break

  //       case 'C08P':
  //       case 'C08PT':
  //       case '48ZP':
  //       case '48FS':
  //       case '48F':
  //         setModuleSelectionEnable(false)
  //         form.setFieldValue('enableSlot2', true)
  //         form.setFieldValue('selectedOptionOfSlot2', optionList?.[0]?.[0]?.value)
  //         break

  //       default:
  //         setModuleSelectionEnable(true)
  //         break
  //     }
  //   }
  // }

  // const getSlots = (selectedFamily: string, selectedModel: string) => {
  //   const familyIndex = selectedFamily as keyof typeof ICX_MODELS_MODULES

  //   const familyList = ICX_MODELS_MODULES[familyIndex]
  //   const modelIndex = selectedModel as keyof typeof familyList

  //   const slots = familyList[modelIndex]
  //   setSlots(slots)
  //   setSlotOptionList(slots, 1, setOptionListForSlot2)
  //   setSlotOptionList(slots, 2, setOptionListForSlot3)
  //   setSlotOptionList(slots, 3, setOptionListForSlot4)
  // }

  // const setSlotOptionList = (
  //   slots: string[][],
  //   slotIndex: number,
  //   setSlotOptionsList: { (value: SetStateAction<ModelsType[]>): void }) =>{
  //   const slotOptions: ModelsType[] = []
  //   if (slots.length > slotIndex) {
  //     for (let value of slots?.[slotIndex]) {
  //       const name = value.toString().split('X').join(' X ')
  //       slotOptions.push({ label: name, value: value.toString() })
  //     }
  //     setSlotOptionsList(slotOptions)
  //   }
  // }

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
    // console.log('****** onModelChange: ')
    const family = form.getFieldValue('family')

    // const values = form.getFieldsValue()

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
    form.setFieldValue('switchFamilyModels', {
      ...switchFamilyModels,
      model: `${family}-${model}`,
      slots: []
    })

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
    const { slots, slotOptionLists } = getSlots(family, model)
    setOptionList(slotOptionLists)
    setSlots(slots)

    const {
      moduleSelectionEnable,
      module2SelectionEnable,
      enableSlot2,
      enableSlot3
      // selectedOptionOfSlot2,
      // selectedOptionOfSlot3
    } = checkIfModuleFixedTemp(family, model)

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

    // console.log(
    //   {
    //     moduleSelectionEnable,
    //     module2SelectionEnable,
    //     enableSlot2,
    //     enableSlot3
    //     // selectedOptionOfSlot2,
    //     // selectedOptionOfSlot3
    //   }
    // )
    // getSlots(family, model)



    // setSwitchFamilyModels(
    //   { ...switchFamilyModels, slots: [] }
    // )

    updateModelPortData(family, model)

    // const { slots, slotOptionLists } = getSlots(family, model)
    // setOptionList(slotOptionLists)
    // setSlots(slots)
    // setSwitchFamilyModels(
    //   { ...switchFamilyModels, slots: [] }
    // )

    // updateModelPortData(family, model)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onCheckChange = function (e: CheckboxChangeEvent, slot: string) {
    // console.log('onCheckChange: ', slot)
    // switch(slot){
    //   case 'slot2':
    //     // setEnableSlot2(e.target.checked)
    //     form.setFieldValue('selectedOptionOfSlot2', optionList[0][0]?.value)
    //     break
    //   case 'slot3':
    //     // setEnableSlot3(e.target.checked)
    //     form.setFieldValue('selectedOptionOfSlot3', optionList[1][0]?.value)
    //     break
    //   // case 'slot4':
    //   //   // setEnableSlot4(e.target.checked)
    //   //   form.setFieldValue('selectedOptionOfSlot4', optionList[2][0]?.value)
    //   //   break
    // }
    onModuleChange()
  }

  const onModuleChange = () => {
    // console.log('onModuleChange: ')
    // getSlots(form.getFieldValue('family'), form.getFieldValue('model'))

    form.setFieldValue('switchFamilyModels', {
      ...switchFamilyModels,
      slots: []
    })

    // setSwitchFamilyModels(
    //   { ...switchFamilyModels, slots: [] }
    // )
    updateModelPortData(form.getFieldValue('family'), form.getFieldValue('model'))
  }

  const updateModelPortData = (selectedFamily: string, selectedModel: string) => {
    for (let slotNumber = 1; slotNumber <= 4; slotNumber++) {
      updateSlotPortData(slotNumber, selectedFamily, selectedModel)
    }
  }

  const updateSlotPortData =
  (slotNumber: number, selectedFamily: string, selectedModel: string) => {

    // console.log('updateSlotPortData: ', slotNumber )

    const { slotOptionLists } = getSlots(selectedFamily, selectedModel)
    const optionList = slotOptionLists ////

    // console.log('updateSlotPortData: ', optionList, slots )


    if (slotNumber === 1) {
      generateSlotData(slotNumber, true, [], '', selectedFamily, selectedModel)
    } else {
      const enable = form.getFieldValue(`enableSlot${slotNumber}`)
      let option = form.getFieldValue(`selectedOptionOfSlot${slotNumber}`)

      let optionList2 = optionList?.[0]//optionListForSlot2
      switch (slotNumber) {
        case 3:
          optionList2 = optionList?.[1] // optionListForSlot3
          break
        // case 4:
        //   optionList2 = optionListForSlot4
        //   break
      }
      if (!enable) {
        option = ''
      }
      else if (enable && !option) {
        option = optionList2?.[0] ? optionList2[0].value : option
      }

      // console.log('updateSlotPortData; ', optionList2)

      const index = switchFamilyModels?.slots?.findIndex(
        (s: { slotNumber: number }) => s.slotNumber === slotNumber) || -1
      if (!enable && index !== -1) {
        switchFamilyModels?.slots?.splice(index, 1)
      }
      generateSlotData(slotNumber, enable, optionList2, option, selectedFamily, selectedModel)
    }
  }

  const generateSlotData =
  (slotNumber: number, slotEnable: boolean, slotOptions: DefaultOptionType[],
    slotOption: string, selectedFamily: string, selectedModel: string) => {

    const switchFamilyModels = form.getFieldValue('switchFamilyModels')
    const { slotOptionLists } = getSlots(selectedFamily, selectedModel)
    const optionList = slotNumber === 1 ? [] : slotOptionLists?.[0] ////
    // console.log('generateSlotData: ', slotNumber, optionList, switchFamilyModels)

    if (slotEnable) {
      let totalPortNumber: string = '0'
      let slotPortInfo: string = ''

      if (optionList?.length > 1) {
        if (slotOption === '' || slotOption === undefined) {
          slotOption = optionList[0].value as string ////
        }
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

      const slotData = {
        slotNumber: slotNumber,
        enable: slotEnable,
        option: slotOption,
        slotPortInfo: slotPortInfo,
        portStatus: generatePortData(totalPortNumber)
      }

      const slotIndex = switchFamilyModels?.slots?.findIndex(
        (s: { slotNumber: number }) => s.slotNumber === slotNumber)

      const tmpModelPortData = { ...switchFamilyModels }
      if (slotIndex === -1) {
        tmpModelPortData.slots.push(slotData)
      } else {
        if(switchFamilyModels?.slots){
          tmpModelPortData.slots[slotIndex] = slotData
        }
      }
      tmpModelPortData.slots = tmpModelPortData.slots?.sort(
        function (a: { slotNumber: number }, b: { slotNumber: number }) {
          return a.slotNumber > b.slotNumber ? 1 : -1
        })
      tmpModelPortData.model = selectedFamily + '-' + selectedModel

      //setSwitchFamilyModels(tmpModelPortData)

      form.setFieldValue('switchFamilyModels', tmpModelPortData)
      // console.log('update switchFamilyModels: ', tmpModelPortData)
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
            hidden={!(slots && slots?.length > 1 && module2SelectionEnable)}>
            <Col span={optionList?.[0]?.length === 1 ? 24 : 7} >
              <Form.Item
                name={'enableSlot2'}
                initialValue={false}
                valuePropName='checked'
                children={
                  <Checkbox
                    data-testid='module2Checkbox'
                    onChange={(e)=>{ onCheckChange(e, 'slot2') }}
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
                name={'selectedOptionOfSlot2'}
                // initialValue={'1'}
                // initialValue={optionList?.[0]?.[0]?.value}
                hidden={optionList?.[0]?.length===1}
              >
                <Select
                  defaultActiveFirstOption
                  options={optionList?.[0]}
                  disabled={!enableSlot2temp}
                  // disabled={!enableSlot2}
                  onChange={onModuleChange}
                />
              </Form.Item>}
            </Col>
          </Row>
          {/* <Row hidden={!(slots && slots?.length > 2 && module3SelectionEnable)}> */}
          <Row hidden={!(slots && slots?.length > 2)}>
            <Col span={optionList?.[1]?.length === 1 ? 24 : 7} >
              <Form.Item
                name={'enableSlot3'}
                initialValue={false}
                valuePropName='checked'
                children={
                  <Checkbox
                    data-testid='module3Checkbox'
                    onChange={(e)=>{ onCheckChange(e, 'slot3') }}
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
                name={'selectedOptionOfSlot3'}
                // initialValue={optionList?.[1]?.[0]?.value}
                hidden={optionList?.[1]?.length===1}
              >
                <Select
                  options={optionList?.[1]}
                  disabled={!enableSlot3temp}
                  onChange={onModuleChange}
                />
              </Form.Item>}
            </Col>
          </Row>
          {/* <Row hidden={!(slots && slots?.length > 3)}>
            <Col span={optionListForSlot4.length===1 ? 24 : 7}>
              <Form.Item
                name={'enableSlot4'}
                initialValue={false}
                valuePropName='checked'
                children={
                  <Checkbox
                    onChange={(e)=>{ onCheckChange(e, 'slot4') }}
                  >
                    {$t({ defaultMessage: 'Module 4:' })}
                    {optionListForSlot4.length===1 &&
                      ' ' + optionListForSlot4[0]?.value.split('X').join(' X ')}
                  </Checkbox>
                }
              />
            </Col>
            <Col span={10} >
              <Form.Item
                name={'selectedOptionOfSlot4'}
                initialValue={optionListForSlot4[0]?.value}
                hidden={optionListForSlot4.length===1}
              >
                <Select
                  options={optionListForSlot4}
                  disabled={!enableSlot4}
                  onChange={onModuleChange}
                />
              </Form.Item>
            </Col>
          </Row> */}
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