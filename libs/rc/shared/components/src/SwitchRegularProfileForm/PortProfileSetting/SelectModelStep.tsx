
import { useState, useEffect, useContext } from 'react'

import { Row, Col, Form, Radio, Typography, RadioChangeEvent, Checkbox, Input } from 'antd'
import { CheckboxChangeEvent }                                                  from 'antd/lib/checkbox'

import { Card, Tooltip }          from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { ICX_MODELS_MODULES }     from '@acx-ui/rc/utils'
import { getIntl }                from '@acx-ui/utils'

import * as UI          from './styledComponents'
import VlanPortsContext from './VlanPortsContext'


export interface ModelsType {
  label: string
  value: string
}

export interface PortsType {
  slotNumber: number,
  portNumber: number
  portTagged: string
}

type ModelFilterMap = {
  [key: string]: boolean;
}

export function SelectModelStep (props: { editMode: boolean }) {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { vlanSettingValues } = useContext(VlanPortsContext)
  const { editMode } = props

  const [families, setFamilies] = useState<ModelsType[]>([])
  const [models, setModels] = useState<ModelsType[]>([])
  const [modelFilterMap, setModelFilterMap] = useState<ModelFilterMap>({})
  const [family, setFamily] = useState('')

  const isSupport8200AV = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200AV)
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)

  const addModelFilter = (key: string) => {
    setModelFilterMap(prevMap => ({
      ...prevMap,
      [key]: false
    }))
  }

  const toggleModelFilter = (key: string) => {
    setModelFilterMap(prevMap => ({
      ...prevMap,
      [key]: !prevMap[key]
    }))
  }

  const setAllModelFiltersHidden = (): void => {
    setModelFilterMap(prevMap =>
      Object.fromEntries(
        Object.entries(prevMap).map(([key]) => [key, false])
      )
    )
  }

  useEffect(() => {
    if(ICX_MODELS_MODULES){
      const modules = Object.keys(ICX_MODELS_MODULES)
        .filter(key => isSupport8100 || key !== 'ICX8100')
      const familiesData = modules.map(key => {
        return { label: `ICX-${key.split('ICX')[1]}`, value: key }
      })
      setFamilies(familiesData)
      setModels(generateModelArray())
    }
    if(ICX_MODELS_MODULES && vlanSettingValues.family && vlanSettingValues.model){
      const selectedFamily = vlanSettingValues.family
      const selectedModel = vlanSettingValues.model
      const slots = vlanSettingValues.switchFamilyModels?.slots
      const selectedEnable2 = slots?.filter(
        (item: { slotNumber: number }) => item.slotNumber === 2)[0] ||
        { enable: false, option: '' }
      const selectedEnable3 = slots?.filter(
        (item: { slotNumber: number }) => item.slotNumber === 3)[0] ||
        { enable: false, option: '' }
      const selectedEnable4 = slots?.filter(
        (item: { slotNumber: number }) => item.slotNumber === 4)[0] ||
        { enable: false, option: '' }
      form.setFieldsValue({
        family: selectedFamily,
        model: selectedModel,
        enableSlot2: selectedEnable2.enable,
        enableSlot3: selectedEnable3.enable,
        enableSlot4: selectedEnable4.enable,
        selectedOptionOfSlot2: selectedEnable2.option,
        selectedOptionOfSlot3: selectedEnable3.option,
        selectedOptionOfSlot4: selectedEnable4.option
      })
      setFamily(selectedFamily)
      familyChangeAction(selectedFamily)
    }
  }, [vlanSettingValues])

  const generateModelArray = () => {
    const modelArray = []

    for (const family in ICX_MODELS_MODULES) {
      addModelFilter(family)
      for (const model in ICX_MODELS_MODULES[family as keyof typeof ICX_MODELS_MODULES]) {
        if (!isSupport8200AV && family === 'ICX8200') {
          if (model === '24PV' || model === 'C08PFV') {
            continue
          }
        }
        modelArray.push({ label: `${family}-${model}`, value: `${family}-${model}` })
      }
    }

    return modelArray
  }

  const onFamilyChange = (e: RadioChangeEvent) => {
    setAllModelFiltersHidden()
    toggleModelFilter(e.target.value)
  }

  const onFamilyCheckboxChange = (e: CheckboxChangeEvent) => {
    if(e.target.checked){
      const modelsVal = [
        ...(form.getFieldValue('model') || []),
        ...models.filter((model) => {
          const family = model.value.split('-')[0]
          return family === e.target.value
        }).map((model) => model.value)]
      form.setFieldValue('model', modelsVal)
    }else{
      const currentModels = form.getFieldValue('model')
      const modelsVal = Array.isArray(currentModels)
        ? currentModels.filter(
          (model: string) => model.split('-')[0] !== e.target.value
        )
        : []
      form.setFieldValue('model', modelsVal)
    }
    setAllModelFiltersHidden()
    toggleModelFilter(e.target.value)
  }

  const familyChangeAction = (family: string) => {
    setAllModelFiltersHidden()
    toggleModelFilter(family)
  }

  return (
    <>
      <Row gutter={20} style={{ marginTop: '20px' }}>
        <Col span={4}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Family' })}</Typography.Title>
          <UI.MainGroupListLayout>
            <Card>
              <Form.Item
                name={'family'}
                required={true}
                initialValue={family}
                children={<Radio.Group onChange={onFamilyChange}
                >
                  {families.map(({ label, value }) => (
                    <Radio key={value} value={value} disabled={editMode}>
                      <Row gutter={20}>
                        <Col span={5}>
                          <Checkbox value={value} onChange={onFamilyCheckboxChange}/>
                        </Col>
                        <Col>
                          <Tooltip
                            title={''}>
                            <div data-testid={value} className='label-class'>{label}</div>
                          </Tooltip>
                        </Col>
                      </Row>
                    </Radio>
                  ))}
                </Radio.Group>}
              />
            </Card>
          </UI.MainGroupListLayout>
        </Col>
        <Col span={4}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Model' })}</Typography.Title>
          <UI.SubGroupListLayout>
            <Card>
              <Form.Item
                name={'model'}
                required={true}
                children={<Checkbox.Group>
                  {models.map(({ label, value }) => (
                    <Checkbox
                      key={value}
                      value={value}
                      disabled={editMode}
                      style={{ display: modelFilterMap[value.split('-')[0]] ? 'flex' : 'none' }}
                    >
                      {label}
                    </Checkbox>
                  ))}
                </Checkbox.Group>}
              />
            </Card>
          </UI.SubGroupListLayout>
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
