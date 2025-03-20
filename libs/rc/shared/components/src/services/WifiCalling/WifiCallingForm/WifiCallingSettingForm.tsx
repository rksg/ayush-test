import React, { useContext, useEffect } from 'react'

import { Form, Input, Select } from 'antd'
import TextArea                from 'antd/lib/input/TextArea'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { GridCol, GridRow, StepsForm }                                   from '@acx-ui/components'
import { Features, useIsSplitOn }                                        from '@acx-ui/feature-toggle'
import {
  useGetEnhancedWifiCallingServiceListQuery, useGetEnhancedWifiCallingServiceTemplateListQuery,
  useGetWifiCallingServiceQuery, useGetWifiCallingServiceTemplateQuery
} from '@acx-ui/rc/services'
import {
  QosPriorityEnum,
  WifiCallingActionTypes,
  servicePolicyNameRegExp,
  wifiCallingQosPriorityLabelMapping,
  useConfigTemplateQueryFnSwitcher
} from '@acx-ui/rc/utils'

import { ProtectedEnforceTemplateToggleP1 } from '../../../configTemplates'
import WifiCallingFormContext               from '../WifiCallingFormContext'

import EpdgTable from './EpdgTable'

type WifiCallingSettingFormProps = {
  edit?: boolean
}

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'qosPriority',
    'tenantId',
    'epdgs',
    'networkIds'
  ]
}

const WifiCallingSettingForm = (props: WifiCallingSettingFormProps) => {
  const { $t } = useIntl()
  const { edit } = props

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const form = Form.useFormInstance()

  const {
    state, dispatch
  } = useContext(WifiCallingFormContext)
  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetWifiCallingServiceQuery,
    useTemplateQueryFn: useGetWifiCallingServiceTemplateQuery,
    skip: !useParams().hasOwnProperty('serviceId'),
    enableRbac
  })

  const { data: dataList } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetEnhancedWifiCallingServiceListQuery,
    useTemplateQueryFn: useGetEnhancedWifiCallingServiceTemplateListQuery,
    payload: defaultPayload,
    enableRbac
  })

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
      <Select.Option value='WIFICALLING_PRI_VOICE'>
        {$t(wifiCallingQosPriorityLabelMapping[QosPriorityEnum.WIFICALLING_PRI_VOICE])}
      </Select.Option>
      <Select.Option value='WIFICALLING_PRI_VIDEO'>
        {$t(wifiCallingQosPriorityLabelMapping[QosPriorityEnum.WIFICALLING_PRI_VIDEO])}
      </Select.Option>
      <Select.Option value='WIFICALLING_PRI_BE'>
        {$t(wifiCallingQosPriorityLabelMapping[QosPriorityEnum.WIFICALLING_PRI_BE])}
      </Select.Option>
      <Select.Option value='WIFICALLING_PRI_BG'>
        {$t(wifiCallingQosPriorityLabelMapping[QosPriorityEnum.WIFICALLING_PRI_BG])}
      </Select.Option>
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
            qosPriority: data.qosPriority,
            networkIds: [...data.networkIds ?? []],
            oldNetworkIds: data.networkIds ?? [],
            isEnforced: data.isEnforced
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
    <GridRow>
      <GridCol col={{ span: 10 }}>
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
              if (!edit && value && dataList?.data.length && dataList?.data.findIndex((profile) =>
                profile.name === value) !== -1
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
        <div style={{ marginTop: '20px' }}>
          <ProtectedEnforceTemplateToggleP1 templateId={data?.id} />
        </div>
      </GridCol>
    </GridRow>
  )
}

export default WifiCallingSettingForm
