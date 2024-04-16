import React, { useContext, useEffect, useState } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm }    from '@acx-ui/components'
import {
  useEnhancedRoguePoliciesQuery,
  useGetRoguePolicyTemplateListQuery,
  useGetRoguePolicyTemplateQuery,
  useRoguePolicyQuery
} from '@acx-ui/rc/services'
import {
  RogueAPDetectionActionTypes,
  servicePolicyNameRegExp,
  useConfigTemplate,
  useConfigTemplateQueryFnSwitcher,
  useTableQuery
} from '@acx-ui/rc/utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import RuleTable from './RuleTable'

type RogueAPDetectionSettingFormProps = {
  edit: boolean
}

export const RogueAPDetectionSettingForm = (props: RogueAPDetectionSettingFormProps) => {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const { edit } = props
  const [originalName, setOriginalName] = useState('')

  const form = Form.useFormInstance()

  const {
    state, dispatch
  } = useContext(RogueAPDetectionContext)

  const { data } = useConfigTemplateQueryFnSwitcher(
    useRoguePolicyQuery, useGetRoguePolicyTemplateQuery, !edit
  )

  const defaultPayload = {
    searchString: '',
    fields: [
      'id',
      'name'
    ]
  }

  const settingsId = 'policies-rogue-ap-detection-setting-form-table'
  const tableQuery = useTableQuery({
    useQuery: isTemplate ? useGetRoguePolicyTemplateListQuery : useEnhancedRoguePoliciesQuery,
    defaultPayload,
    pagination: { settingsId, pageSize: 1000 }
  })

  const handlePolicyName = (policyName: string) => {
    dispatch({
      type: RogueAPDetectionActionTypes.POLICYNAME,
      payload: {
        policyName: policyName
      }
    })
  }

  const handleDescription = (desc: string) => {
    dispatch({
      type: RogueAPDetectionActionTypes.DESCRIPTION,
      payload: {
        description: desc
      }
    })
  }

  useEffect(() => {
    if (edit && data) {
      let policyData = data
      dispatch({
        type: RogueAPDetectionActionTypes.UPDATE_STATE,
        payload: {
          state: {
            ...state,
            description: policyData.description ?? '',
            policyName: policyData.name ?? '',
            venues: policyData.venues ?? [],
            rules: policyData.rules ?? []
          }
        }
      })
      setOriginalName(data.name || '')
      form.setFieldValue('policyName', policyData.name ?? '')
      form.setFieldValue('description', policyData.description ?? '')
    }
  }, [data])


  return (
    <>
      <Row gutter={20}>
        <Col span={10}>
          <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
          <Form.Item
            name='policyName'
            label={$t({ defaultMessage: 'Policy Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: async (rule, value) => {
                if (!edit && value
                    && tableQuery.data?.data.findIndex((policy) => policy.name === value) !== -1) {
                  return Promise.reject(
                    $t({ defaultMessage: 'The rogue policy with that name already exists' })
                  )
                }
                if (edit && value && value !== originalName
                    && tableQuery.data?.data.filter((policy) => policy.name !== originalName)
                      .findIndex((policy) => policy.name === value) !== -1) {
                  return Promise.reject(
                    $t({ defaultMessage: 'The rogue policy with that name already exists' })
                  )
                }
                return Promise.resolve()
              } },
              { validator: (_, value) => servicePolicyNameRegExp(value) }
            ]}
            validateFirst
            hasFeedback
            initialValue={state.policyName}
            children={<Input
              onChange={(event => {handlePolicyName(event.target.value)})}/>}
          />
          <Form.Item
            name='description'
            label={$t({ defaultMessage: 'Description' })}
            rules={[
              { max: 255 }
            ]}
            initialValue={state.description}
            children={<Input
              onChange={(event => handleDescription(event.target.value))}/>}
          />
        </Col>
      </Row>
      <Row>
        <Col span={17}>
          <Form.Item
            name='rules'
            label={$t({ defaultMessage: 'Classification rules' })}
            rules={[
              { validator: async () => {
                return new Promise<void>((resolve, reject) => {
                  if (state.rules.length === 0) {
                    return reject(
                      $t({ defaultMessage: 'No rules have been created yet' })
                    )
                  }
                  return resolve()
                })
              } }
            ]}
          >
            <RuleTable edit={edit}/>
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
