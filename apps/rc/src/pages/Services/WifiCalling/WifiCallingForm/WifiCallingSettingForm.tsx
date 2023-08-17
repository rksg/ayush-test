import React, { useContext, useEffect } from 'react'

import { Col, Form, Input, Row, Select } from 'antd'
import TextArea                          from 'antd/lib/input/TextArea'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { StepsForm }                                                        from '@acx-ui/components'
import { useGetWifiCallingServiceListQuery, useGetWifiCallingServiceQuery } from '@acx-ui/rc/services'
import { QosPriorityEnum, WifiCallingActionTypes, servicePolicyNameRegExp } from '@acx-ui/rc/utils'

import { wifiCallingQosPriorityLabelMapping } from '../../contentsMap'
import WifiCallingFormContext                 from '../WifiCallingFormContext'

import EpdgTable from './EpdgTable'

type WifiCallingSettingFormProps = {
  edit?: boolean
}

const WifiCallingSettingForm = (props: WifiCallingSettingFormProps) => {
  const { $t } = useIntl()
  const { edit } = props

  const form = Form.useFormInstance()

  const {
    state, dispatch
  } = useContext(WifiCallingFormContext)
  const { data } = useGetWifiCallingServiceQuery({ params: useParams() }, {
    skip: !useParams().hasOwnProperty('serviceId')
  })

  const { data: dataList } = useGetWifiCallingServiceListQuery({ params: useParams() })

  const handleServiceName = (serviceName: string) => {
    dispatch({
      type: WifiCallingActionTypes.SERVICENAME,
      payload: {
        serviceName: serviceName
      }
    })
  }

  const handleDescription = (description: string) => {
    dispatch({
      type: WifiCallingActionTypes.DESCRIPTION,
      payload: {
        description: description
      }
    })
  }

  const handleQosPriority = (qosPriority:QosPriorityEnum) => {
    dispatch({
      type: WifiCallingActionTypes.QOSPRIORITY,
      payload: {
        qosPriority: qosPriority
      }
    })
  }

  const selectQosPriority = (
    <Select
      style={{ width: '100%' }}
      data-testid='selectQosPriorityId'
      onChange={(options) => handleQosPriority(options.toString() as QosPriorityEnum)}>
      <option value='WIFICALLING_PRI_VOICE'>
        {$t(wifiCallingQosPriorityLabelMapping[QosPriorityEnum.WIFICALLING_PRI_VOICE])}
      </option>
      <option value='WIFICALLING_PRI_VIDEO'>
        {$t(wifiCallingQosPriorityLabelMapping[QosPriorityEnum.WIFICALLING_PRI_VIDEO])}
      </option>
      <option value='WIFICALLING_PRI_BE'>
        {$t(wifiCallingQosPriorityLabelMapping[QosPriorityEnum.WIFICALLING_PRI_BE])}
      </option>
      <option value='WIFICALLING_PRI_BG'>
        {$t(wifiCallingQosPriorityLabelMapping[QosPriorityEnum.WIFICALLING_PRI_BG])}
      </option>
    </Select>
  )

  useEffect(() => {
    if (data && state.serviceName === '') {
      dispatch({
        type: WifiCallingActionTypes.UPDATE_STATE,
        payload: {
          state: {
            ...state,
            ePDG: data.epdgs,
            serviceName: data.serviceName,
            tags: data.tags,
            description: data.description,
            qosPriority: data.qosPriority
          }
        }
      })
    }
    if (data && form) {
      form.setFieldValue('serviceName', data.serviceName)
      form.setFieldValue('description', data.description)
      form.setFieldValue('qosPriority', data.qosPriority)
    }
    if (state.ePDG.length) {
      form.validateFields()
    }
  }, [data, state.ePDG.length])

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='serviceName'
          label={$t({ defaultMessage: 'Service Name' })}
          rules={[
            { required: true },
            { whitespace: true },
            { min: 2 },
            { max: 32 },
            { validator: async (rule, value) => {
              if (!edit && value && dataList?.length && dataList?.findIndex((profile) =>
                profile.serviceName === value) !== -1
              ) {
                return Promise.reject(
                  $t({ defaultMessage: 'The wifi calling service with that name already exists' })
                )
              }
              return Promise.resolve()
            } },
            { validator: (_, value) => servicePolicyNameRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          initialValue={state.serviceName}
          children={<Input
            onChange={(event => {handleServiceName(event.target.value)})}/>}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          initialValue={state.description}
          children={<TextArea
            rows={4}
            maxLength={64}
            onChange={(event => handleDescription(event.target.value))}/>}
        />
        <Form.Item
          name='qosPriority'
          label={$t({ defaultMessage: 'QoS Priority' })}
          initialValue={state.qosPriority}
          children={selectQosPriority}
        />

        <Form.Item
          name='dataGateway'
          label={$t({ defaultMessage: 'Evolved Packet Data Gateway (ePDG)' })}
          initialValue={0}
          rules={[
            { required: true },
            { validator: () => {
              if (state.ePDG.length) return Promise.resolve()
              return Promise.reject($t({ defaultMessage: 'ePDG must contain at least one rule' }))
            } }
          ]}
        >
          <EpdgTable edit={edit} />
        </Form.Item>
      </Col>

      <Col span={14}>
      </Col>
    </Row>
  )
}

export default WifiCallingSettingForm
