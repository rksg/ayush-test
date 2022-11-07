import React, { MutableRefObject, useContext, useEffect } from 'react'

import { ProFormInstance }               from '@ant-design/pro-form'
import { Col, Form, Input, Row, Select } from 'antd'
import TextArea                          from 'antd/lib/input/TextArea'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { StepsForm }                                                        from '@acx-ui/components'
import { useGetWifiCallingServiceListQuery, useGetWifiCallingServiceQuery } from '@acx-ui/rc/services'
import { CreateNetworkFormFields, QosPriorityEnum, WifiCallingActionTypes } from '@acx-ui/rc/utils'

import WifiCallingFormContext from '../WifiCallingFormContext'

import EpdgTable from './EpdgTable'

const { Option } = Select

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

  const handleTags = (tags: string[]) => {
    dispatch({
      type: WifiCallingActionTypes.TAGS,
      payload: {
        tags: tags
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
      data-testid='selectQosPriorityId'
      onChange={(options) => handleQosPriority(options.toString() as QosPriorityEnum)}>
      <Option value='WIFICALLING_PRI_VOICE'>
        {$t({ defaultMessage: 'WIFICALLING_PRI_VOICE' })}
      </Option>
      <Option value='WIFICALLING_PRI_VIDEO'>
        {$t({ defaultMessage: 'WIFICALLING_PRI_VIDEO' })}
      </Option>
      <Option value='WIFICALLING_PRI_BE'>
        {$t({ defaultMessage: 'WIFICALLING_PRI_BE' })}
      </Option>
      <Option value='WIFICALLING_PRI_BG'>
        {$t({ defaultMessage: 'WIFICALLING_PRI_BG' })}
      </Option>
    </Select>
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
      formRef.current?.setFieldValue('tags', data.tags?.join(','))
      formRef.current?.setFieldValue('description', data.description)
      formRef.current?.setFieldValue('qosPriority', data.qosPriority)
    }
  }, [data])


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
                if (!edit && value && dataList?.findIndex((profile) =>
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
          name='tags'
          label={$t({ defaultMessage: 'Tags' })}
          initialValue={state.tags?.join(',')}
          children={<Input
            onChange={(event => handleTags(event.target.value.split(',')))}/>}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          rules={[
            { required: true },
            { min: 2 }
          ]}
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
