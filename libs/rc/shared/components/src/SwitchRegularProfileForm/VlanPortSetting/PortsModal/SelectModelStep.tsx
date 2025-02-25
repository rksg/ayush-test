
import { useState, useEffect } from 'react'

import { Row, Col, Form, Radio, Typography, RadioChangeEvent, Checkbox, Select, Input } from 'antd'
import { CheckboxChangeEvent }                                                          from 'antd/lib/checkbox'
import { DefaultOptionType }                                                            from 'antd/lib/select'

import { Card, Tooltip, useStepFormContext }             from '@acx-ui/components'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { ICX_MODELS_MODULES, SwitchSlot2 as SwitchSlot } from '@acx-ui/rc/utils'
import { getIntl }                                       from '@acx-ui/utils'

import { checkIfModuleFixed, PortSetting, ModulePorts } from '../index.utils'

import { getSlots, getModelModules, generateSlotData } from './PortsModal.utils'
import * as UI                                         from './styledComponents'

export function SelectModelStep (props: {
  editMode: boolean
  editRecord?: ModulePorts
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
  const [ slots ] = [ // enableSlot2, enableSlot3,
    // Form.useWatch('family', form),
    // Form.useWatch('model', form),
    // Form.useWatch<boolean>('enableSlot2', form),
    // Form.useWatch<boolean>('enableSlot3', form),
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
      // 'enableSlot4',
      'selectedOptionOfSlot2',
      'selectedOptionOfSlot3'
      // 'selectedOptionOfSlot4'
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
    form.resetFields(['enableSlot2', 'enableSlot3'])
    form.setFieldValue('model', e.target.value)
    form.setFieldValue('slots', [])
    form.setFieldValue('portSettings', [])

    setModuleSelectionEnable(true)
    setModule2SelectionEnable(true)
    modelChangeAction(family, e.target.value)
  }

  const modelChangeAction = (family: string, model: string) => {
    if (!editMode) {
      setModuleSelectionEnable(true)
      setModule2SelectionEnable(true)
    } else {
      setModuleSelectionEnable(true)
    }

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
      ...(!form.getFieldValue('enableSlot2') ? {
        selectedOptionOfSlot2: slotOptionLists?.[0]?.[0]?.value } : {}),
      ...(!form.getFieldValue('enableSlot3') ? {
        selectedOptionOfSlot3: slotOptionLists?.[1]?.[0]?.value } : {})
    })

    updateModelPortData(family, model)
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
    const { portSettings } = form.getFieldsValue(true)
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

    const updatedSlots = Array.from({ length: moduleCount }, (_, i) => {
      const slotNumber = i+1
      return generateSlotData(slotNumber, family, model, form)
    }).filter(Boolean)

    const updatedPortSettings = (portSettings as PortSetting[]).filter(port => {
      const [, slot, slotNumber] = port.port.split('/')
      const slotInfo = updatedSlots.find(s => s?.slotNumber === Number(slot))
      const [maxSlotNumber] = slotInfo?.slotPortInfo.split('X') ?? ''
      return slotInfo && (Number(slotNumber) <= Number(maxSlotNumber))
    })

    // eslint-disable-next-line no-console
    console.log('updatedSlots: ', updatedSlots)
    // eslint-disable-next-line no-console
    console.log('updatedPortSettings: ', updatedPortSettings)
    form.setFieldValue('slots', updatedSlots)
    form.setFieldValue('portSettings', updatedPortSettings)
  }

  // eslint-disable-next-line no-console
  console.log('slots: ', slots)
  // eslint-disable-next-line no-console
  console.log('modelModules: ', modelModules)

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

  const ModuleSelectionRow = ({ index }: { index: number }) => {
    const { $t } = getIntl()
    const optionListForSlot = optionList?.[index] ?? []
    const isSingleOption = optionListForSlot.length === 1
    const enableSlotKey = `enableSlot${index + 2}`
    const selectedOptionKey = `selectedOptionOfSlot${index + 2}`
    const moduleSelectionEnable = index === 0 ? module2SelectionEnable : true

    return (
      <Row hidden={!(modelModules && modelModules.length > index + 1 && moduleSelectionEnable)}>
        <Col span={isSingleOption ? 24 : 7}>
          <Form.Item name={enableSlotKey} initialValue={false} valuePropName='checked'>
            <Checkbox
              data-testid={`module${index + 2}Checkbox`}
              onChange={(e) => onCheckChange(e, `${index + 2}`)}
            >
              { $t({ defaultMessage: 'Module {num}:' }, { num: index + 2 }) }
              { isSingleOption
                && ` ${optionListForSlot?.[0]?.value?.toString().split('X').join(' X ')}`
              }
            </Checkbox>
          </Form.Item>
        </Col>
        <Col span={10}>
          {optionListForSlot.length > 0 && (
            <Form.Item name={selectedOptionKey} hidden={isSingleOption}>
              <Select
                options={optionListForSlot}
                disabled={!form.getFieldValue(enableSlotKey)}
                onChange={onModuleChange}
              />
            </Form.Item>
          )}
        </Col>
      </Row>
    )
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
        <Col span={9} flex='400px' hidden={!moduleSelectionEnable}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Select Modules' })}</Typography.Title>
          {/* <Row style={{ paddingTop: '5px' }}
            hidden={!(modelModules && modelModules?.length > 1 && module2SelectionEnable)}>
            <Col span={optionList?.[0]?.length === 1 ? 24 : 7} >
              <Form.Item
                name='enableSlot2'
                initialValue={false}
                valuePropName='checked'
                children={
                  <Checkbox
                    data-testid='module2Checkbox'
                    onChange={(e)=>{ onCheckChange(e, '2') }}
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
          </Row> */}

          { Array.from({ length: 2 }, (_, index) =>
            <ModuleSelectionRow key={index} index={index} />
          ) }

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