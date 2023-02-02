import React, { MutableRefObject, useContext, useEffect } from 'react'

import { ProFormInstance }                      from '@ant-design/pro-form'
import { Col, Form, Input, Row, Select, Space } from 'antd'
import { useIntl }                              from 'react-intl'
import { useParams }                            from 'react-router-dom'

import { StepsForm }                   from '@acx-ui/components'
import { useGetSyslogPolicyListQuery } from '@acx-ui/rc/services'
import {
  FacilityEnum,
  FlowLevelEnum,
  ProtocolEnum,
  SyslogActionTypes,
  SyslogContextType,
  serverIpAddressRegExp
} from '@acx-ui/rc/utils'

import { facilityLabelMapping, flowLevelLabelMapping, protocolLabelMapping } from '../../contentsMap'
import SyslogContext                                                         from '../SyslogContext'

const { Option } = Select

type SyslogSettingFormProps = {
  edit: boolean,
  formRef?: MutableRefObject<ProFormInstance<SyslogContextType> | undefined>
}

const SyslogSettingForm = (props: SyslogSettingFormProps) => {
  const { $t } = useIntl()
  const { edit, formRef } = props
  const params = useParams()

  const {
    state, dispatch
  } = useContext(SyslogContext)

  const { data } = useGetSyslogPolicyListQuery({ params: params })

  useEffect(() => {
    if (edit && data) {
      let policyData = data.filter(d => d.id === params.policyId)[0]
      dispatch({
        type: SyslogActionTypes.UPDATE_STATE,
        payload: {
          state: {
            ...state,
            policyName: policyData.name ?? ''
          }
        }
      })
      formRef?.current?.setFieldValue('policyName', policyData.name ?? '')
    }
  }, [data])

  const handlePolicyName = (policyName: string) => {
    dispatch({
      type: SyslogActionTypes.POLICYNAME,
      payload: {
        policyName: policyName
      }
    })
  }

  const handleServer = (server: string) => {
    dispatch({
      type: SyslogActionTypes.SERVER,
      payload: {
        server: server
      }
    })
  }

  const handlePort = (port: string) => {
    dispatch({
      type: SyslogActionTypes.PORT,
      payload: {
        port: port
      }
    })
  }

  const handleProtocol = (protocol: string) => {
    dispatch({
      type: SyslogActionTypes.PROTOCOL,
      payload: {
        protocol: protocol
      }
    })
  }

  const selectProtocol = (
    <Select
      data-testid='selectProtocol'
      style={{ width: '100%' }}
      onChange={(evt) => {
        handleProtocol(evt)
      }}
    >
      {Object.keys(ProtocolEnum).map((type) => (
        <Option key={type} value={type}>
          {$t(protocolLabelMapping[type as keyof typeof ProtocolEnum])}
        </Option>
      ))}
    </Select>
  )

  const handleSecondaryServer = (server: string) => {
    dispatch({
      type: SyslogActionTypes.SECONDARYSERVER,
      payload: {
        secondaryServer: server
      }
    })
  }

  const handleSecondaryPort = (port: string) => {
    dispatch({
      type: SyslogActionTypes.SECONDARYPORT,
      payload: {
        secondaryPort: port
      }
    })
  }

  const handleSecondaryProtocol = (protocol: string) => {
    dispatch({
      type: SyslogActionTypes.SECONDARYPROTOCOL,
      payload: {
        secondaryProtocol: protocol
      }
    })
  }

  const selectSecondaryProtocol = (
    <Select
      data-testid='selectProtocol2'
      style={{ width: '100%' }}
      onChange={(evt) => {
        handleSecondaryProtocol(evt)
      }}
    >
      {Object.keys(ProtocolEnum).map((type) => (
        <Option key={type} value={type}>
          {$t(protocolLabelMapping[type as keyof typeof ProtocolEnum])}
        </Option>
      ))}
    </Select>
  )

  const handleFacility = (facility: string) => {
    dispatch({
      type: SyslogActionTypes.FACILITY,
      payload: {
        facility: facility
      }
    })
  }

  const selectFacility = (
    <Select
      data-testid='selectFacility'
      style={{ width: '490px' }}
      onChange={(evt) => {
        handleFacility(evt)
      }}
    >
      {Object.keys(FacilityEnum).map((type) => (
        <Option key={type} value={type}>
          {$t(facilityLabelMapping[type as keyof typeof FacilityEnum])}
        </Option>
      ))}
    </Select>
  )

  const handleFlowLevel = (flowLevel: string) => {
    dispatch({
      type: SyslogActionTypes.FLOWLEVEL,
      payload: {
        flowLevel: flowLevel
      }
    })
  }

  const selectFlowLevel = (
    <Select
      data-testid='selectFlowLevel'
      style={{ width: '490px' }}
      onChange={(evt) => {
        handleFlowLevel(evt)
      }}
    >
      {Object.keys(FlowLevelEnum).map((type) => (
        <Option key={type} value={type}>
          {$t(flowLevelLabelMapping[type as keyof typeof FlowLevelEnum])}
        </Option>
      ))}
    </Select>
  )

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
            style={{ width: '490px' }}
            onChange={(event => {handlePolicyName(event.target.value)})}
          />}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Primary Server' })}
        >
          <Space>
            <Form.Item
              name='server'
              label={$t({ defaultMessage: 'Server Address' })}
              rules={[
                { required: true },
                { validator: (_, value) => serverIpAddressRegExp(value) }
              ]}
            >
              <Input
                data-testid='server'
                onChange={(event => {handleServer(event.target.value)})}
                placeholder={$t({ defaultMessage: 'Server Ip' })}
              />
            </Form.Item>
            <Form.Item
              name='port'
              label={$t({ defaultMessage: 'Port' })}
              rules={[
                { required: true },
                { min: 1 },
                { max: 5 }
              ]}
              children={<Input
                data-testid='port'
                onChange={(event => {handlePort(event.target.value)})}/>}
            />
            <Form.Item
              name='protocol'
              label={$t({ defaultMessage: 'Protocol' })}
              initialValue={ProtocolEnum.UDP}
              rules={[
                { required: true }
              ]}
              children={selectProtocol}
            />
          </Space>
        </Form.Item>
        <Form.Item
          label={$t({ defaultMessage: 'Secondary Server' })}
        >
          <Space>
            <Form.Item
              name='secondaryServer'
              label={$t({ defaultMessage: 'Server Address' })}
              rules={[
                { validator: (_, value) => serverIpAddressRegExp(value) }
              ]}
            >
              <Input
                data-testid='server2'
                onChange={(event => {handleSecondaryServer(event.target.value)})}
                placeholder={$t({ defaultMessage: 'Server Ip' })}
              />
            </Form.Item>
            <Form.Item
              name='secondaryPort'
              label={$t({ defaultMessage: 'Port' })}
              rules={[
                { min: 1 },
                { max: 5 }
              ]}
              children={<Input
                data-testid='port2'
                onChange={(event => {handleSecondaryPort(event.target.value)})}/>}
            />
            <Form.Item
              name='secondaryProtocol'
              label={$t({ defaultMessage: 'Protocol' })}
              initialValue={ProtocolEnum.TCP}
              children={selectSecondaryProtocol}
            />
          </Space>
        </Form.Item>
        <Form.Item
          name='facility'
          label={$t({ defaultMessage: 'Event Facility' })}
          rules={[
            { required: true }
          ]}
          initialValue={FacilityEnum.KEEP_ORIGINAL}
          children={selectFacility}
        />
        <Form.Item
          name='flowLevel'
          label={$t({ defaultMessage: 'Send Logs' })}
          rules={[
            { required: true }
          ]}
          initialValue={FlowLevelEnum.CLIENT_FLOW}
          children={selectFlowLevel}
        />
      </Col>
    </Row>
  )
}

export default SyslogSettingForm
