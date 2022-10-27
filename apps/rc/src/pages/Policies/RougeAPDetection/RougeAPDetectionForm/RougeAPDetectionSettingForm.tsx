import React, { MutableRefObject, useContext, useEffect } from 'react'

import { ProFormInstance }       from '@ant-design/pro-form'
import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { StepsForm }                                         from '@acx-ui/components'
import { useGetRougePolicyListQuery }                        from '@acx-ui/rc/services'
import {
  RougeAPDetectionActionTypes, RougeAPDetectionContextType
} from '@acx-ui/rc/utils'

import RougeAPDetectionContext from '../RougeAPDetectionContext'

import RuleTable from './RuleTable'

type RougeAPDetectionSettingFormProps = {
  edit: boolean,
  formRef?: MutableRefObject<ProFormInstance<RougeAPDetectionContextType> | undefined>
}

const RougeAPDetectionSettingForm = (props: RougeAPDetectionSettingFormProps) => {
  const { $t } = useIntl()
  const { edit, formRef } = props
  const params = useParams()

  const {
    state, dispatch
  } = useContext(RougeAPDetectionContext)

  const { data } = useGetRougePolicyListQuery({
    params: params,
    payload: {
      page: 1,
      pageSize: 10000,
      url: '/api/viewmodel/tenant/{tenantId}/rogue/policy'
    }
  })

  const handlePolicyName = (policyName: string) => {
    dispatch({
      type: RougeAPDetectionActionTypes.POLICYNAME,
      payload: {
        policyName: policyName
      }
    })
  }

  const handleTags = (tags: string[]) => {
    dispatch({
      type: RougeAPDetectionActionTypes.TAGS,
      payload: {
        tags: tags
      }
    })
  }

  useEffect(() => {
    console.log('run useEffect')
    let policyData
    if (edit && data && state.policyName === '' && formRef) {
      console.log(data, params.policyId)
      policyData = data.data && data.data.filter(d => d.id === params.policyId)[0]
      dispatch({
        type: RougeAPDetectionActionTypes.UPDATE_STATE,
        payload: {
          state: {
            ...state,
            policyName: policyData.name ? policyData.name : '',
            venues: policyData.activeVenues
          }
        }
      })
      formRef.current?.setFieldValue('policyName', policyData.name ? policyData.name : '')
      console.log(formRef.current)
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
            { max: 32 }
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
        >
          <RuleTable edit={edit}/>
        </Form.Item>
      </Col>

      <Col span={14}>
      </Col>
    </Row>
  )
}

export default RougeAPDetectionSettingForm
