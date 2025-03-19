import { useState, useEffect } from 'react'

import { Col, Checkbox, Form, Input, Row, Space, Typography } from 'antd'
import _                                                      from 'lodash'
import { useIntl }                                            from 'react-intl'

import { Button, cssStr, StepsForm, Tooltip, useStepFormContext }          from '@acx-ui/components'
import { Features, useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { useGetProfilesQuery, useGetSwitchConfigProfileTemplateListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  CliTemplateVariable,
  SwitchProfileModel,
  TableResult,
  getSwitchModel,
  useConfigTemplateQueryFnSwitcher,
  whitespaceOnlyRegExp,
  ICX_MODELS_MODULES
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

import { profilesPayload } from './'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

type IcxModel = Record<string, Record<string, string[][]>>

interface IcxModelFamily {
  family: string,
  models: string[]
}

export function CliStepModels () {
  const { $t } = useIntl()
  const params = useParams()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSupport8200AV = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200AV)
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)
  const isSupport8100X = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100X)
  const isSupport8100Or8100X = isSupport8100 || isSupport8100X

  const { form, editMode } = useStepFormContext()

  const { data: profiles } = useConfigTemplateQueryFnSwitcher<TableResult<SwitchProfileModel>>({
    useQueryFn: useGetProfilesQuery,
    useTemplateQueryFn: useGetSwitchConfigProfileTemplateListQuery,
    payload: profilesPayload,
    enableRbac: isSwitchRbacEnabled
  })

  const [count, setCount] = useState(0)
  const [filteredModelFamily, setFilteredModelFamily] = useState([] as CheckboxValueType[])
  const [appliedModels, setAppliedModels] = useState([] as string[])

  const getAllFamilyModel = (
    isSupport8200AV: boolean,
    isSupport8100: boolean,
    isSupport8100X: boolean) => {
    const filteredModels = (model: string) => {
      switch (model) {
        case 'ICX8200-24PV':
        case 'ICX8200-C08PFV':
          return isSupport8200AV
        case 'ICX8100-24':
        case 'ICX8100-24P':
        case 'ICX8100-48':
        case 'ICX8100-48P':
        case 'ICX8100-C08PF':
          return isSupport8100
        case 'ICX8100-24-X':
        case 'ICX8100-24P-X':
        case 'ICX8100-48-X':
        case 'ICX8100-48P-X':
        case 'ICX8100-C08PF-X':
          return isSupport8100X
        default:
          return true
      }
    }

    return transformIcxModels(ICX_MODELS_MODULES)
      .map(family => ({
        ...family,
        models: family.models.filter(model => filteredModels(model))
      }))
      .filter(family => family.models.length > 0)
  }

  const allFamilyModels = getAllFamilyModel(isSupport8200AV, isSupport8100, isSupport8100X)
  const allModels:string[] = allFamilyModels.map((m) => m.models).flat()

  const existingProfileNameList = profiles?.data?.filter(
    t => !editMode || t.id !== params?.profileId
  ).map(t => t.name) ?? []

  useEffect(() => {
    const { variables } = form.getFieldsValue(true)
    const appliedSerialNumbers = (variables as CliTemplateVariable[])
      ?.filter(v => v?.switchVariables)
      ?.map(v => v?.switchVariables?.map(
        switchVariable => switchVariable?.serialNumbers
      ).flat()).flat() ?? []
    const modelList = _.uniq(
      appliedSerialNumbers.map(serial => getSwitchModel(serial as string))
    ) as string[]

    const allFamily = Object.keys(ICX_MODELS_MODULES)
      .filter(key => isSupport8100Or8100X || key !== 'ICX8100')
    form.setFieldValue('selectedFamily', allFamily)
    setFilteredModelFamily(allFamily)
    setAppliedModels(modelList)
    setCount(form.getFieldValue('models')?.length)
  }, [])

  const onModelFamilyChange = (checkedValues: CheckboxValueType[]) => {
    setFilteredModelFamily(checkedValues)
  }

  const onSelectAllModels = (selectAll: boolean) => {
    const selected = form.getFieldValue('models') ?? []
    const selectedModels = selectAll
      ? [
        ...selected,
        ...getVisibleModelList(allFamilyModels, filteredModelFamily)]
      : selected.filter((m: string) => {
        const visibleModelList = getVisibleModelList(allFamilyModels, filteredModelFamily)
        const removeableModelList = _.difference(visibleModelList, appliedModels)
        return !removeableModelList.includes(m)
      })
    const updateSelected = _.uniq(selectedModels)

    form.setFieldValue('models', updateSelected)
    setCount(updateSelected.length)
  }

  const checkAllSelected = () => {
    const selected = form.getFieldValue('models') ?? []
    const currentModels = getVisibleModelList(allFamilyModels, filteredModelFamily)
    const currentModelsSelected = _.intersection(selected, currentModels)
    return currentModelsSelected.length === currentModels.length
  }

  return <>
    <Row gutter={24}>
      <Col span={8}>
        <StepsForm.Title>{$t({ defaultMessage: 'Models' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Profile Name' })}
          rules={[
            { required: true },
            { max: 64 },
            { validator: (_, value) => whitespaceOnlyRegExp(value) },
            {
              validator: (_, value) => checkObjectNotExists(
                existingProfileNameList, value, $t({ defaultMessage: 'Profile' })
              )
            }
          ]}
          initialValue=''
          validateFirst
          hasFeedback
          children={<Input />}
        />
      </Col>
    </Row>

    <Row>
      <Space size={4} style={{ display: 'flex', fontSize: '12px', marginBottom: '8px' }}>
        <Space>
          {$t({ defaultMessage: 'Select switch models' })}
        </Space>
        <Space style={{ color: cssStr('--acx-accents-orange-50') }}>*</Space>
      </Space>
    </Row>
    <Row style={{ maxWidth: '900px' }}>
      <Col span={5}>
        <UI.FamilyGroupPanel>
          <Typography.Text>
            {$t({ defaultMessage: 'Filter by switch model family:' })}
          </Typography.Text>
          <Form.Item
            noStyle
            name='selectedFamily'
            children={
              <UI.FamilyGroup
                onChange={onModelFamilyChange}
              > {
                  Object.keys(ICX_MODELS_MODULES)
                    .filter(key => isSupport8100Or8100X || key !== 'ICX8100')
                    .map(family => <Row key={family}>
                      <Checkbox value={family}>{family}</Checkbox>
                    </Row>
                    )
                } </UI.FamilyGroup>
            }
          />
        </UI.FamilyGroupPanel>
      </Col>
      <Col span={16}>
        <Space style={{
          display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '12px'
        }}>
          {$t({ defaultMessage: '{count} Models selected' }, { count })}
          <Space>
            <Button
              type='link'
              size='small'
              disabled={checkAllSelected()}
              onClick={() => onSelectAllModels(true)}>
              {$t({ defaultMessage: 'Select All' })}
            </Button>
            <Button
              type='link'
              size='small'
              disabled={
                !getVisibleModelList(allFamilyModels, filteredModelFamily)?.length
                || !checkAllSelected()
              }
              onClick={() => onSelectAllModels(false)}>
              {$t({ defaultMessage: 'Deselect All' })}
            </Button>
          </Space>
        </Space>

        <Form.Item
          noStyle
          name='models'
          children={<UI.FamilyModelsGroup
            onChange={() => {
              setCount(form.getFieldValue('models')?.length)
            }}>
            {
              allModels.map(model =>
                <Tooltip
                  title={appliedModels.includes(model)
                  // eslint-disable-next-line max-len
                    ? $t({ defaultMessage: 'This switch model is already selected for variable customization in the next step.' })
                    : ''}
                  key={`${model}-tip`}
                >
                  <Checkbox
                    value={model}
                    key={model}
                    disabled={appliedModels.includes(model)}
                    style={{ display: checkModelOptionVisiable(model, filteredModelFamily) }}
                  >{model}</Checkbox>
                </Tooltip>
              )
            }
          </UI.FamilyModelsGroup>}
          rules={[{ required: true }]}
        />
      </Col>
    </Row>
  </>
}

function transformIcxModels (icxModels: IcxModel) {
  return Object.keys(icxModels)?.reduce(
    (result: IcxModelFamily[], key: string) => ([
      ...result, {
        family: key,
        models: Object.keys(icxModels[key]).map(model => `${key}-${model}`)
      }
    ]), [])
}

function checkModelOptionVisiable (model: string, filteredModelFamily: CheckboxValueType[]) {
  return filteredModelFamily
    .filter(f => model.includes(f.toString()))?.length? 'flex' : 'none'
}

function getVisibleModelList (models: IcxModelFamily[], filteredModelFamily: CheckboxValueType[]) {
  return models
    .filter(m => filteredModelFamily.includes(m.family))
    .map(m => m.models).flat()
}
