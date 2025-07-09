import React, { useContext, useEffect } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm }              from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useEnhancedRoguePoliciesQuery,
  useGetRoguePolicyTemplateListQuery,
  useGetRoguePolicyTemplateQuery,
  useRoguePolicyQuery
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  EnhancedRoguePolicyType,
  PolicyType,
  policyTypeLabelMapping,
  RogueApConstant,
  RogueAPDetectionActionTypes,
  servicePolicyNameRegExp,
  useConfigTemplateQueryFnSwitcher
} from '@acx-ui/rc/utils'
import { TableResult } from '@acx-ui/utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import RuleTable from './RuleTable'

type RogueAPDetectionSettingFormProps = {
  edit: boolean
}

export const RogueAPDetectionSettingForm = (props: RogueAPDetectionSettingFormProps) => {
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { $t } = useIntl()
  const { edit } = props

  const form = Form.useFormInstance()

  const {
    state, dispatch
  } = useContext(RogueAPDetectionContext)

  const { data: policyData } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useRoguePolicyQuery,
    useTemplateQueryFn: useGetRoguePolicyTemplateQuery,
    skip: !edit,
    enableRbac
  })

  // eslint-disable-next-line max-len
  const { data: policyList } = useConfigTemplateQueryFnSwitcher<TableResult<EnhancedRoguePolicyType>>({
    useQueryFn: useEnhancedRoguePoliciesQuery,
    useTemplateQueryFn: useGetRoguePolicyTemplateListQuery,
    payload: { page: 1, pageSize: 10000 },
    enableRbac
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
    if (edit && policyData && policyList) {
      const policy = policyList.data?.find(p => p.id === policyData?.id)
      // eslint-disable-next-line max-len
      const defaultPolicyId = policyList.data?.find(p => p.name === RogueApConstant.DefaultProfile)?.id
      if (policy) {
        dispatch({
          type: RogueAPDetectionActionTypes.UPDATE_STATE,
          payload: {
            state: {
              ...state,
              id: policyData.id,
              description: policyData.description ?? '',
              policyName: policyData.name ?? '',
              venues: policy.venueIds.map((id: string) => ({ id, name: '' })),
              oldVenues: policy.venueIds.map((id: string) => ({ id, name: '' })),
              rules: policyData.rules ?? [],
              defaultPolicyId: defaultPolicyId ?? ''
            }
          }
        })
      }
      form.setFieldValue('policyName', policyData.name ?? '')
      form.setFieldValue('description', policyData.description ?? '')
    }
  }, [policyData, policyList])

  const nameValidator = (value: string) => {
    const list = (policyList?.data ?? [])
      .filter(n => n.id !== policyData?.id)
      .map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value } , $t(policyTypeLabelMapping[PolicyType.ROGUE_AP_DETECTION]))
  }


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
              { validator: (_, value) => nameValidator(value) },
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
