import React, { useEffect, useState } from 'react'

import { Form, Input, Radio, Space } from 'antd'
import { useIntl }                   from 'react-intl'
import { useParams }                 from 'react-router-dom'
import { v4 as uuidv4 }              from 'uuid'

import { Button, Descriptions, GridCol, GridRow, Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  useLazyAdaptivePolicyListByQueryQuery,
  useLazyGetRadiusAttributeGroupQuery,
  usePolicyTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AccessCondition,
  AttributeAssignment,
  checkObjectNotExists,
  CriteriaOption,
  RadiusAttributeGroup
} from '@acx-ui/rc/utils'

import { AccessConditionDrawer }            from './AccessConditionDrawer'
import { RadiusAttributeGroupSelectDrawer } from './RadiusAttributeGroupSelectDrawer'

interface AdaptivePolicySettingFormProps {
  editMode?: boolean,
  drawerMode?: boolean
}

export function AdaptivePolicySettingForm (props: AdaptivePolicySettingFormProps) {
  const { $t } = useIntl()
  const { editMode = false, drawerMode = false } = props

  const evaluationRules = Form.useWatch('evaluationRules')
  const templateId = Form.useWatch('templateTypeId')
  const attributeGroupId = Form.useWatch('attributeGroupId')

  const [accessConditionsVisible, setAccessConditionsVisible] = useState(false)
  const [attributeGroupVisible, setAttributeGroupVisible] = useState(false)

  const [editConditionMode, setEditConditionMode] = useState(false)
  // eslint-disable-next-line max-len
  const [selectRadiusAttributeGroup, setSelectRadiusAttributeGroup] = useState({} as RadiusAttributeGroup)
  const [editCondition, setEditCondition] = useState<AccessCondition>()

  const form = Form.useFormInstance()
  const { policyId } = useParams()

  const [getPolicySetList] = useLazyAdaptivePolicyListByQueryQuery()

  const { data: templateList, isLoading } = usePolicyTemplateListQuery({
    payload: {
      page: '1',
      pageSize: '1000',
      sortField: 'name',
      sortOrder: 'desc' }
  })

  const [getAttributeGroup] = useLazyGetRadiusAttributeGroupQuery()

  useEffect( () =>{
    if(attributeGroupId) {
      let radiusAttributeGroup = {} as RadiusAttributeGroup
      getAttributeGroup({
        params: { policyId: attributeGroupId }
      }).then(result => radiusAttributeGroup = {
        id: result.data?.id,
        name: result.data?.name ?? '',
        attributeAssignments: result.data?.attributeAssignments ?? []
      } ).finally(() => setSelectRadiusAttributeGroup(radiusAttributeGroup))
    } else {
      setSelectRadiusAttributeGroup({} as RadiusAttributeGroup)
    }
  }, [attributeGroupId])

  const useColumns = () => {
    const { $t } = useIntl()
    const columns: TableProps<AccessCondition>['columns'] = [
      {
        key: 'name',
        title: $t({ defaultMessage: 'Condition Type' }),
        dataIndex: 'name',
        render: function (data, row) {
          return row.name
        }
      },
      {
        title: $t({ defaultMessage: 'Condition Value' }),
        key: 'conditionValue',
        dataIndex: 'conditionValue',
        render: function (data, row) {
          if(row.evaluationRule.criteriaType === CriteriaOption.DATE_RANGE) {
            // eslint-disable-next-line max-len
            return `${row.evaluationRule?.when} ${row.evaluationRule?.startTime} - ${row.evaluationRule?.endTime}`
          } else {
            return row.evaluationRule.regexStringCriteria
          }
        }
      }
    ]
    return columns
  }

  const nameValidator = async (value: string) => {
    const list = (await getPolicySetList({
      params: {
        excludeContent: 'false'
      },
      payload: {
        fields: [ 'name' ],
        page: 0, pageSize: 10,
        filters: { name: value }
      }
    }).unwrap()).data.filter(n => n.id !== policyId).map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'Adaptive Policy' }))
  }

  const setAccessCondition = (condition: AccessCondition) => {
    const newConditions: AccessCondition[] = evaluationRules ? evaluationRules.slice() : []
    if (editConditionMode) {
      const targetIdx = newConditions.findIndex((r: AccessCondition) => r.id === condition.id)
      newConditions.splice(targetIdx, 1, condition)
    } else {
      condition.id = uuidv4()
      newConditions.push(condition)
    }
    form.setFieldValue('evaluationRules', newConditions)
  }

  const rowActions: TableProps<AccessCondition>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows, clearSelection) => {
        setEditConditionMode(true)
        setAccessConditionsVisible(true)
        setEditCondition(selectedRows[0])
        clearSelection()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Attribute' }),
            entityValue: selectedRows[0].name
          },
          onOk: () => {
            const newConditions = evaluationRules.filter((r: AccessCondition) => {
              return selectedRows[0].id !== r.id
            })
            form.setFieldValue('evaluationRules', newConditions)
            clearSelection()
          }
        })
      }
    }
  ]

  const getAttributes = function (attributes: Partial<AttributeAssignment> [] | undefined) {
    const rows = []
    if(attributes) {
      for (const attribute of attributes) {
        rows.push(
          <Descriptions.Item
            key={attribute.attributeName}
            label={attribute.attributeName}
            children={attribute.attributeValue}/>
        )
      }
    }
    return <Descriptions labelWidthPercent={30} children={rows}/>
  }

  return (
    <>
      <GridRow >
        <GridCol col={{ span: drawerMode ? 24 : 10 }}>
          <Form.Item name='name'
            label={$t({ defaultMessage: 'Policy Name' })}
            rules={[
              { required: true },
              { validator: (_, value) => nameValidator(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input/>}
          />
          <Loader states={[{ isLoading }]}>
            <Form.Item name='templateTypeId'
              label={$t({ defaultMessage: 'Policy Type' })}
              rules={[
                { required: true }
              ]}
              children={
                <Radio.Group
                  disabled={editMode}
                  onChange={() => {
                    setAccessConditionsVisible(false)
                    form.setFieldValue('evaluationRules', [])
                  }}>
                  <Space direction='vertical'>
                    {templateList?.data.map(({ id, ruleType }) => (
                      <Radio key={ruleType} value={id}>
                        {ruleType}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              }/>
          </Loader>
          <Form.Item
            name='evaluationRules'
            label={$t({ defaultMessage: 'Access Conditions' })}
            rules={[
              {
                required: true,
                message: $t({ defaultMessage: 'Please create access conditions' })
              }]}
          >
            <>
              {/* eslint-disable-next-line max-len */}
              {$t({ defaultMessage: 'Only clients who meet All conditions you define will be able to connect' })}
              <Table
                rowKey='id'
                columns={useColumns()}
                dataSource={evaluationRules}
                rowActions={rowActions}
                rowSelection={{ type: 'radio' }}
                actions={[{
                  label: $t({ defaultMessage: 'Add' }),
                  onClick: () => {
                    setEditConditionMode(false)
                    setEditCondition(undefined)
                    setAccessConditionsVisible(true)
                  }
                }]}
              />
            </>
          </Form.Item>
          <Form.Item
            name='attributeGroupId'
            label={$t({ defaultMessage: 'RADIUS Attribute Group' })}
            rules={[
              { required: true,
                message: $t({ defaultMessage: 'Please select group' }) }
            ]}
          >
            <>
              {$t({ defaultMessage: 'The RADIUS attributes to apply when this policy is matched' })}
            </>
          </Form.Item>
          <Space>
            <label>{selectRadiusAttributeGroup.id ?
              selectRadiusAttributeGroup.name :
              $t({ defaultMessage: 'No Group selected' })}</label>
            <Button type={'link'} onClick={() => setAttributeGroupVisible(true)}>
              {selectRadiusAttributeGroup.id ?
                $t({ defaultMessage: 'Change Group' }) :
                $t({ defaultMessage: 'Select Group' })
              }
            </Button>
          </Space>
          {getAttributes(selectRadiusAttributeGroup.attributeAssignments)}
        </GridCol>
      </GridRow>
      <AccessConditionDrawer
        visible={accessConditionsVisible}
        setVisible={setAccessConditionsVisible}
        setAccessCondition={setAccessCondition}
        editCondition={editCondition}
        isEdit={editConditionMode}
        accessConditions={evaluationRules}
        templateId={templateId}/>
      <RadiusAttributeGroupSelectDrawer
        visible={attributeGroupVisible}
        setVisible={setAttributeGroupVisible}
        settingForm={form}/>
    </>
  )
}
