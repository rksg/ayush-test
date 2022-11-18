import React, { MutableRefObject, useContext, useEffect } from 'react'

import { ProFormInstance }       from '@ant-design/pro-form'
import { Col, Form, Input, Row } from 'antd'
import TextArea                  from 'antd/lib/input/TextArea'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { StepsForm }                                                        from '@acx-ui/components'
import { useGetWifiCallingServiceListQuery, useGetWifiCallingServiceQuery } from '@acx-ui/rc/services'
import { CreateNetworkFormFields, QosPriorityEnum, WifiCallingActionTypes } from '@acx-ui/rc/utils'

import WifiCallingFormContext from '../WifiCallingFormContext'

import EpdgTable from './EpdgTable'

type WifiCallingSettingFormProps = {
  edit?: boolean,
  formRef?: MutableRefObject<ProFormInstance<CreateNetworkFormFields> | undefined>
}

const WifiCallingSettingForm = (props: WifiCallingSettingFormProps) => {
  const { $t } = useIntl()
  const { edit, formRef } = props

  const {
    state, dispatch
  } = useContext(WifiCallingFormContext)
  const { data } = useGetWifiCallingServiceQuery({ params: useParams() })

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
    <select
      style={{ width: '100%' }}
      data-testid='selectQosPriorityId'
      onChange={(options) => handleQosPriority(options.toString() as QosPriorityEnum)}>
      <option value='WIFICALLING_PRI_VOICE'>
        {$t({ defaultMessage: 'WIFICALLING_PRI_VOICE' })}
      </option>
      <option value='WIFICALLING_PRI_VIDEO'>
        {$t({ defaultMessage: 'WIFICALLING_PRI_VIDEO' })}
      </option>
      <option value='WIFICALLING_PRI_BE'>
        {$t({ defaultMessage: 'WIFICALLING_PRI_BE' })}
      </option>
      <option value='WIFICALLING_PRI_BG'>
        {$t({ defaultMessage: 'WIFICALLING_PRI_BG' })}
      </option>
    </select>
  )

  useEffect(() => {
    if (data && state.serviceName === '') {
      dispatch({
        type: WifiCallingActionTypes.UPDATE_STATE,
        payload: {
          state: {
            ...state,
            serviceName: data.serviceName,
            tags: data.tags,
            description: data.description,
            qosPriority: data.qosPriority
          }
        }
      })
    }
    if (data && formRef) {
      formRef.current?.setFieldValue('serviceName', data.serviceName)
      formRef.current?.setFieldValue('description', data.description)
      formRef.current?.setFieldValue('qosPriority', data.qosPriority)
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
            { min: 2 },
            { max: 32 },
            { validator: async (rule, value) => {
              return new Promise<void>((resolve, reject) => {
                if (!edit && value && dataList?.length && dataList?.findIndex((profile) =>
                  profile.serviceName === value) !== -1
                ) {
                  return reject(
                    $t({ defaultMessage: 'The wifi calling service with that name already exists' })
                  )
                }
                return resolve()
              })
            } }
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
