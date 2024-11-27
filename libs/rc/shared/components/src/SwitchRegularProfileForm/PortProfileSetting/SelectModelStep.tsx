
import { useState, useEffect } from 'react'

import { Row, Col, Form, Radio, Typography, RadioChangeEvent, Checkbox } from 'antd'
import { CheckboxChangeEvent }                                           from 'antd/lib/checkbox'

import { Card, Tooltip }          from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { ICX_MODELS_MODULES }     from '@acx-ui/rc/utils'
import { getIntl }                from '@acx-ui/utils'

import * as UI from './styledComponents'
// import VlanPortsContext from './VlanPortsContext'


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

export function SelectModelStep (props: { editMode: boolean }) {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  // const { vlanSettingValues } = useContext(VlanPortsContext)
  const { editMode } = props

  const [families, setFamilies] = useState<ModelsType[]>([])
  const [models, setModels] = useState<ModelsType[]>([])
  const [modelFilterMap, setModelFilterMap] = useState<ModelBoolMap>({})
  const [familyCheckboxes, setFamilyCheckboxes] = useState<ModelBoolMap>({})
  const [indeterminateMap, setIndeterminateMap] = useState<ModelBoolMap>({})

  const isSupport8200AV = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200AV)
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)

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
      const modules = Object.keys(ICX_MODELS_MODULES)
        .filter(key => isSupport8100 || key !== 'ICX8100')
      const familiesData = modules.map(key => {
        return { label: `ICX-${key.split('ICX')[1]}`, value: key }
      })
      setFamilies(familiesData)
      setModels(generateModelList())
    }
  }, [ICX_MODELS_MODULES])

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
    const currentModels = form.getFieldValue('model')
    if(e.target.checked){
      const modelsVal = [
        ...(currentModels || []),
        ...models.filter((model) => {
          const family = model.value.split('-')[0]
          return family === selectedFamily
        }).map((model) => model.value)]
      form.setFieldValue('model', modelsVal)
      toggleFamilyCheckbox(selectedFamily, true)
    }else{
      const modelsVal = Array.isArray(currentModels)
        ? currentModels.filter(
          (model: string) => model.split('-')[0] !== selectedFamily
        )
        : []
      form.setFieldValue('model', modelsVal)
      toggleFamilyCheckbox(selectedFamily, false)
    }
    form.setFieldValue('family', selectedFamily)
    toggleIndeterminateMap(selectedFamily, false)
    setAllModelFiltersHidden()
    toggleModelFilter(selectedFamily)
  }

  const onModelCheckboxGroupChange = (modelsGroupValues: string[]) => {
    const familiesModelsMap = families.map((familyVal) => {
      const modelsList = modelsGroupValues?.filter((value) => {
        const family = (value as string).split('-')?.[0]
        return family === familyVal.value
      })
      return { family: familyVal, models: modelsList }
    })
    familiesModelsMap.map((family) => {
      if(family.models?.length > 0){
        const modelListLength = models.filter(
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

  return (
    <Row gutter={20} style={{ marginTop: '20px' }}>
      <Col span={4}>
        <Typography.Title level={3}>{$t({ defaultMessage: 'Family' })}</Typography.Title>
        <UI.MainGroupListLayout>
          <Card>
            <Form.Item
              name={'family'}
              required={true}
              children={<Radio.Group onChange={onFamilyChange}
              >
                {families.map(({ label, value }) => (
                  <Radio key={value} value={value} disabled={editMode}>
                    <Row gutter={20}>
                      <Col span={5}>
                        <Checkbox
                          value={value}
                          checked={familyCheckboxes[value]}
                          indeterminate={indeterminateMap[value]}
                          onChange={onFamilyCheckboxChange}
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
              name={'model'}
              required={true}
              children={<Checkbox.Group
                onChange={(checkedValues) => {
                  onModelCheckboxGroupChange(checkedValues as string[])}}>
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
  )
}
