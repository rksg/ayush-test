import { useContext, useState, useEffect } from 'react'

import { Col, Checkbox, Form, Input, Row, Space, Typography } from 'antd'
import _                                                      from 'lodash'
import { useIntl }                                            from 'react-intl'

import { Button, cssStr, StepsForm }                  from '@acx-ui/components'
import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { useGetProfilesQuery }                        from '@acx-ui/rc/services'
import { checkObjectNotExists, whitespaceOnlyRegExp } from '@acx-ui/rc/utils'
import { ICX_MODELS_MODULES }                         from '@acx-ui/rc/utils'
import { useParams }                                  from '@acx-ui/react-router-dom'

import CliTemplateFormContext from '../../onDemandCli/CliTemplateForm/CliTemplateFormContext'

import * as UI from './styledComponents'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

export enum VariableType {
  ADDRESS = 'ADDRESS',
  RANGE = 'RANGE',
  STRING = 'STRING'
}

type IcxModel = Record<string, Record<string, string[][]>>

interface IcxModelFamily {
  family: string,
  models: string[]
}

const profilesPayload = {
  filterType: null,
  pageSize: 9999,
  sortField: 'name',
  sortOrder: 'DESC'
}

export function CliStepModels () {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()

  const isSupportIcx8200 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200)
  const { editMode, data, setApplyModels } = useContext(CliTemplateFormContext)
  const { data: profiles } = useGetProfilesQuery({ params, payload: profilesPayload })

  const [count, setCount] = useState(0)
  const [filteredModelFamily, setFilteredModelFamily] = useState([] as CheckboxValueType[])

  const icxModels = _.omit(ICX_MODELS_MODULES, !isSupportIcx8200 ? ['ICX8200'] : []) as IcxModel
  const allFamilyModels = transformIcxModels(icxModels)
  const allModels:string[] = allFamilyModels.map((m) => m.models).flat()

  const existingProfileNameList = profiles?.data?.filter(
    t => !editMode || t.id !== params?.profileId
  ).map(t => t.name) ?? []

  useEffect(() => {
    const allFamily = Object.keys(icxModels)
    form.setFieldValue('selectedFamily', allFamily)
    setFilteredModelFamily(allFamily)
    setApplyModels?.(data?.models ?? [])
  }, [])

  useEffect(() => {
    if (editMode && data) {
      form?.setFieldsValue(data)
      setApplyModels?.(data?.models ?? [])
    }
  }, [data])

  const onModelFamilyChange = (checkedValues: CheckboxValueType[]) => {
    setFilteredModelFamily(checkedValues)
  }

  const onSelectAllModels = (selectAll: boolean) => {
    const selected = form.getFieldValue('models') ?? []
    const updateSelected = selectAll
      ? _.uniq([
        ...selected,
        ...getVisibleModelList(allFamilyModels, filteredModelFamily)
      ]) : _.uniq(selected.filter((m: string) =>
        !getVisibleModelList(allFamilyModels, filteredModelFamily).includes(m)
      ))

    form.setFieldValue('models', updateSelected)
    setApplyModels?.(updateSelected as string[])
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
                  Object.keys(icxModels).map(family => <Row key={family}>
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
          display: 'flex', justifyContent: 'space-between', marginBottom: '12px'
        }}>
          {$t({ defaultMessage: '{count} Models selected' }, { count })}
          <Space>
            <Button
              type='link'
              disabled={checkAllSelected()}
              onClick={() => onSelectAllModels(true)}>
              {$t({ defaultMessage: 'Select All' })}
            </Button>
            <Button
              type='link'
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
            onChange={(values) => {
              setApplyModels?.(values as string[])
              setCount(form.getFieldValue('models')?.length)
            }}>
            {
              allModels.map(model =>
                <Checkbox
                  value={model}
                  key={model}
                  style={{ display: checkModelOptionVisiable(model, filteredModelFamily) }}
                >{model}</Checkbox>
              )
            }
          </UI.FamilyModelsGroup>}
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