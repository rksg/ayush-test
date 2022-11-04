import React, { MutableRefObject, useContext, useEffect } from 'react'

import { ProFormInstance }       from '@ant-design/pro-form'
import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { StepsForm }                                         from '@acx-ui/components'
import { useGetRoguePolicyListQuery }                        from '@acx-ui/rc/services'
import {
  RogueAPDetectionActionTypes, RogueAPDetectionContextType
} from '@acx-ui/rc/utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import RuleTable from './RuleTable'

type RogueAPDetectionSettingFormProps = {
  edit: boolean,
  formRef?: MutableRefObject<ProFormInstance<RogueAPDetectionContextType> | undefined>
}

const RogueAPDetectionSettingForm = (props: RogueAPDetectionSettingFormProps) => {
  const { $t } = useIntl()
  const { edit, formRef } = props
  const params = useParams()

  const {
    state, dispatch
  } = useContext(RogueAPDetectionContext)

  const { data } = useGetRoguePolicyListQuery({
    params: params
  })

  const handlePolicyName = (policyName: string) => {
    dispatch({
      type: RogueAPDetectionActionTypes.POLICYNAME,
      payload: {
        policyName: policyName
      }
    })
  }

  const handleTags = (tags: string[]) => {
    dispatch({
      type: RogueAPDetectionActionTypes.TAGS,
      payload: {
        tags: tags
      }
    })
  }

  useEffect(() => {
    if (edit && data && state.policyName === '') {
      let policyData = data.filter(d => d.id === params.policyId)[0]
      dispatch({
        type: RogueAPDetectionActionTypes.UPDATE_STATE,
        payload: {
          state: {
            ...state,
            policyName: policyData.name ?? '',
            venues: policyData.venues
          }
        }
      })
      formRef?.current?.setFieldValue('policyName', policyData.name ? policyData.name : '')
    }
  }, [data, state.policyName])


  return (
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
              return new Promise<void>((resolve, reject) => {
                if (!edit && value
                  && data?.findIndex((policy) => policy.name === value) !== -1) {
                  return reject(
                    $t({ defaultMessage: 'The rogue policy with that name already exists' })
                  )
                }
                return resolve()
              })
            } }
          ]}
          validateFirst
          hasFeedback
          initialValue={state.policyName}
          children={<Input
            onChange={(event => {handlePolicyName(event.target.value)})}/>}
        />
        <Form.Item
          name='tags'
          label={$t({ defaultMessage: 'Tags' })}
          initialValue={state.tags?.join(',')}
          children={<Input
            onChange={(event => handleTags(event.target.value.split(',')))}/>}
        />

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

      <Col span={14}>
      </Col>
    </Row>
  )
}

export default RogueAPDetectionSettingForm
