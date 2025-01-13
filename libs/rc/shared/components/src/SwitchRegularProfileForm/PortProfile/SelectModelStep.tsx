import { useState, useEffect, useContext, useRef } from 'react'

import { Row, Col, Form, Radio, Typography, RadioChangeEvent, Checkbox } from 'antd'
import { CheckboxChangeEvent }                                           from 'antd/lib/checkbox'

import { Card, Tooltip }          from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { ICX_MODELS_MODULES }     from '@acx-ui/rc/utils'
import { getIntl }                from '@acx-ui/utils'

import PortProfileContext from './PortProfileContext'
import * as UI            from './styledComponents'

export interface ModelsType {
  label: string
  value: string
}

export interface PortsType {
  slotNumber: number,
  portNumber: number
  portTagged: string
}

type ModelBoolMap = {
  [key: string]: boolean;
}

export function SelectModelStep () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { portProfileSettingValues, portProfileList, editMode } = useContext(PortProfileContext)
  const familiesRef = useRef<ModelsType[]>([])
  const modelsRef = useRef<ModelsType[]>([])
  const [ modelFilterMap, setModelFilterMap ] = useState<ModelBoolMap>({})
  const [ familyCheckboxes, setFamilyCheckboxes ] = useState<ModelBoolMap>({})
  const [ indeterminateMap, setIndeterminateMap ] = useState<ModelBoolMap>({})

  const isSupport8200AV = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200AV)
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)

  const selectedModels = editMode ?
    portProfileList?.filter(
      item => item.models.some(model => !portProfileSettingValues.models.includes(model)))
      .flatMap(item => item.models) :
    portProfileList?.flatMap(item => item.models)

  const initState = (key: string) => {
    setModelFilterMap(prevMap => ({
      ...prevMap,
      [key]: false
    }))

    setIndeterminateMap(prevMap => ({
      ...prevMap,
      [key]: false
    }))

    setFamilyCheckboxes(prevMap => ({
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

  const toggleIndeterminateMap = (key: string, value: boolean) => {
    setIndeterminateMap(prevMap => ({
      ...prevMap,
      [key]: value
    }))
  }


  const toggleFamilyCheckbox = (key: string, value: boolean) => {
    setFamilyCheckboxes(prevMap => ({
      ...prevMap,
      [key]: value
    }))
  }

  useEffect(() => {
    if(ICX_MODELS_MODULES){
      form.resetFields(['families'])
      const modules = Object.keys(ICX_MODELS_MODULES)
        .filter(key => isSupport8100 || key !== 'ICX8100')
        .filter(key => key !== 'ICX7150')
      const familiesData = modules.map(key => {
        return { label: `ICX-${key.split('ICX')[1]}`, value: key }
      })
      const modelsList = generateModelList()
      familiesRef.current = familiesData
      modelsRef.current = modelsList

      if(portProfileSettingValues){
        form.setFieldValue('models', portProfileSettingValues.models)
        onModelCheckboxGroupChange(portProfileSettingValues.models)
      }
    }
  }, [ICX_MODELS_MODULES, portProfileSettingValues])

  const generateModelList = () => {
    const modelArray = []

    for (const family in ICX_MODELS_MODULES) {
      initState(family)
      for (const model in ICX_MODELS_MODULES[family as keyof typeof ICX_MODELS_MODULES]) {
        if (!isSupport8200AV && family === 'ICX8200') {
          if (model === '24PV' || model === 'C08PFV') {
            continue
          }
        }
        modelArray.push({ label: `${model}`, value: `${family}-${model}` })
      }
    }

    return modelArray
  }

  const onFamilyChange = (e: RadioChangeEvent) => {
    setAllModelFiltersHidden()
    toggleModelFilter(e.target.value)
  }

  const onFamilyCheckboxChange = (e: CheckboxChangeEvent) => {
    const selectedFamily = e.target.value
    const currentModels = form.getFieldValue('models')
    if(e.target.checked){
      const modelsVal = [
        ...(currentModels || []),
        ...modelsRef.current.filter((model) => {
          const family = model.value.split('-')[0]
          return family === selectedFamily && !selectedModels?.includes(model.value)
        }).map((model) => model.value)]
      form.setFieldValue('models', modelsVal)
      toggleFamilyCheckbox(selectedFamily, true)
    }else{
      const modelsVal = Array.isArray(currentModels)
        ? currentModels.filter(
          (model: string) => model.split('-')[0] !== selectedFamily
        )
        : []
      form.setFieldValue('models', modelsVal)
      toggleFamilyCheckbox(selectedFamily, false)
    }
    form.setFieldValue('families', selectedFamily)
    toggleIndeterminateMap(selectedFamily, false)
    setAllModelFiltersHidden()
    toggleModelFilter(selectedFamily)
  }

  const onModelCheckboxGroupChange = (modelsGroupValues: string[]) => {
    const familiesModelsMap = familiesRef.current.map((familyVal) => {
      const modelsList = modelsGroupValues?.filter((value) => {
        const family = (value as string).split('-')?.[0]
        return family === familyVal.value
      })
      return { family: familyVal, models: modelsList }
    })
    familiesModelsMap.map((family) => {
      if(family.models?.length > 0){
        const modelListLength = modelsRef.current.filter(
          (model) => model.value.includes(family.family.value)).length
        if(family.models?.length < modelListLength){
          toggleIndeterminateMap(family.family.value, true)
          toggleFamilyCheckbox(family.family.value, false)
        }else if(family.models?.length === modelListLength){
          toggleIndeterminateMap(family.family.value, false)
          toggleFamilyCheckbox(family.family.value, true)
        }
      }else{
        toggleIndeterminateMap(family.family.value, false)
        toggleFamilyCheckbox(family.family.value, false)
      }
    })
  }

  const getDisabledFamily = (family: string) => {
    const totalModelsByFamilyCount = modelsRef.current.filter(
      (model) => model.value.includes(family)).length
    const selectedModelsByFamilyCount = selectedModels?.filter(
      model => model.includes(family)).length

    return totalModelsByFamilyCount === selectedModelsByFamilyCount
  }

  return (
    <Row gutter={20} style={{ marginTop: '20px' }}>
      <Col span={4}>
        <Typography.Title level={3}>{$t({ defaultMessage: 'Family' })}</Typography.Title>
        <UI.MainGroupListLayout>
          <Card>
            <Form.Item
              name={'families'}
              required={true}
              children={<Radio.Group onChange={onFamilyChange}
              >
                {familiesRef.current.map(({ label, value }) => (
                  <Radio key={value} value={value}>
                    <Row gutter={20}>
                      <Col span={5}>
                        <Checkbox
                          value={value}
                          data-testid={`family-checkbox-${value}`}
                          checked={familyCheckboxes[value]}
                          indeterminate={indeterminateMap[value]}
                          onChange={onFamilyCheckboxChange}
                          disabled={getDisabledFamily(value)}
                        />
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
              name={'models'}
              required={true}
              initialValue={null}
              children={<Checkbox.Group
                onChange={(checkedValues) => {
                  onModelCheckboxGroupChange(checkedValues as string[])}}>
                {modelsRef.current.map(({ label, value }) => (
                  selectedModels?.includes(value) ?
                    <Tooltip
                      title={$t({
                        defaultMessage: 'This model already has port profiles configured.' })} >
                      <Checkbox
                        key={value}
                        value={value}
                        data-testid={value}
                        style={{ display: modelFilterMap[value.split('-')[0]] ? 'flex' : 'none' }}
                        disabled={selectedModels.includes(value)}
                      >
                        {label}
                      </Checkbox>
                    </Tooltip>
                    : <Checkbox
                      key={value}
                      value={value}
                      data-testid={value}
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
  )
}
