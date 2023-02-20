import React, { useEffect, useState } from 'react'

import { Col, Form, Input, Radio, RadioChangeEvent, Row, Space } from 'antd'
import { useIntl }                                               from 'react-intl'
import { useParams }                                             from 'react-router-dom'
import { v4 as uuidv4 }                                          from 'uuid'

import { Button, Descriptions, showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  useLazyAdaptivePolicyListQuery,
  usePolicyTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AccessCondition,
  AttributeAssignment, checkObjectNotExists,
  RadiusAttributeGroup, RuleTemplate
} from '@acx-ui/rc/utils'

import { AccessConditionDrawer }          from './AccessConditionDrawer'
import { RadiusAttributeGroupDrawer }     from './RadiusAttributeGroupDrawer'
import { RadiusAttributeGroupFormDrawer } from './RadiusAttributeGroupFormDrawer'

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<AccessCondition>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Condition Type' }),
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'Condition Value' }),
      key: 'regexStringCriteria',
      dataIndex: 'regexStringCriteria',
      render: function (data, row) {
        return row.evaluationRule.regexStringCriteria
      }
    }
  ]
  return columns
}

export function AdaptivePolicySettingForm () {
  const { $t } = useIntl()
  const { policyId } = useParams()

  const [accessConditionsVisible, setAccessConditionsVisible] = useState(false)
  const [attributeGroupVisible, setAttributeGroupVisible] = useState(false)
  // eslint-disable-next-line max-len
  const [radiusAttributeGroupFormDrawerVisible, setRadiusAttributeGroupFormDrawerVisible] = useState(false)

  const evaluationRules = Form.useWatch('evaluationRules')
  const [editConditionMode, setEditConditionMode] = useState(false)
  // eslint-disable-next-line max-len
  const [selectRadiusAttributeGroup, setSelectRadiusAttributeGroup] = useState({} as RadiusAttributeGroup)
  const [editCondition, setEditCondition] = useState<AccessCondition>()
  const [templateMode, setTemplateMode] = useState([] as RuleTemplate [])
  const [templateId, setTemplateId] = useState(0)

  const form = Form.useFormInstance()

  const [policyList] = useLazyAdaptivePolicyListQuery()

  // eslint-disable-next-line max-len
  const { data: templateList } = usePolicyTemplateListQuery({ payload: { page: '1', pageSize: '2147483647' } })

  useEffect(() => {
    if(templateList?.data) {
      setTemplateMode(templateList.data)
    }
  }, [templateList?.data])

  const nameValidator = async (value: string) => {
    const list = (await policyList({
      payload: { page: '1', pageSize: '2147483647' }
    }).unwrap()).data.filter(n => n.id !== policyId)
      .map(n => ({ name: n.name }))
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

  const setRadiusAttributeGroup = (group: RadiusAttributeGroup) => {
    setSelectRadiusAttributeGroup(group)
    form.setFieldValue('attributeGroupId', group.id)
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
            label={attribute.attributeName}
            children={attribute.attributeValue}/>
        )
      }
    }
    return <Descriptions labelWidthPercent={30} children={rows}/>
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
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
        <Form.Item name='templateTypeId'
          label={$t({ defaultMessage: 'Template Type' })}
          rules={[
            { required: true }
          ]}
          children={
            <Radio.Group onChange={(e: RadioChangeEvent) => {
              setAccessConditionsVisible(false)
              setTemplateId(e.target.value)
            }}>
              <Space direction='vertical'>
                {templateMode.map(({ id, name }) => (
                  <Radio key={name} value={id}>{name}</Radio>
                ))}
              </Space>
            </Radio.Group>
          }/>
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
        <AccessConditionDrawer
          visible={accessConditionsVisible}
          setVisible={setAccessConditionsVisible}
          setAccessCondition={setAccessCondition}
          editCondition={editCondition}
          templateId={templateId}/>
        <RadiusAttributeGroupDrawer
          visible={attributeGroupVisible}
          setVisible={setAttributeGroupVisible}
          setRadiusAttributeGroup={setRadiusAttributeGroup}
          setRadiusAttributeGroupFormDrawerVisible={setRadiusAttributeGroupFormDrawerVisible}/>
        <RadiusAttributeGroupFormDrawer
          visible={radiusAttributeGroupFormDrawerVisible}
          setVisible={setRadiusAttributeGroupFormDrawerVisible}
        />
      </Col>
    </Row>
  )
}
