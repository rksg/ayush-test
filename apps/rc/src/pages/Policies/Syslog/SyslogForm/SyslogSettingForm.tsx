import { useContext, useEffect, useState } from 'react'

import {
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { StepsForm }                               from '@acx-ui/components'
import { useGetSyslogPolicyListQuery }             from '@acx-ui/rc/services'
import {
  FacilityEnum,
  FlowLevelEnum,
  ProtocolEnum,
  PriorityEnum,
  SyslogActionTypes,
  serverIpAddressRegExp, servicePolicyNameRegExp
} from '@acx-ui/rc/utils'

import { facilityLabelMapping, flowLevelLabelMapping, protocolLabelMapping } from '../../contentsMap'
import SyslogContext                                                         from '../SyslogContext'

const { Option } = Select

type SyslogSettingFormProps = {
  edit: boolean
}

const SyslogSettingForm = (props: SyslogSettingFormProps) => {
  const { $t } = useIntl()
  const { edit } = props
  const params = useParams()
  const [originalName, setOriginalName] = useState('')

  const {
    state, dispatch
  } = useContext(SyslogContext)

  const form = Form.useFormInstance()
  const { data } = useGetSyslogPolicyListQuery({ params: params })

  useEffect(() => {
    if (edit && data) {
      let policyData = data.filter(d => d.id === params.policyId)[0]
      dispatch({
        type: SyslogActionTypes.UPDATE_STATE,
        payload: {
          state: {
            ...state,
            policyName: policyData.name ?? '',
            server: policyData?.primary?.server ?? '',
            port: policyData.primary?.port ?? 514,
            protocol: policyData.primary?.protocol ?? ProtocolEnum.UDP,
            secondaryServer: policyData.secondary?.server ?? '',
            secondaryPort: policyData.secondary?.port ?? 514,
            secondaryProtocol: policyData.secondary?.protocol ?? ProtocolEnum.TCP,
            facility: policyData.facility ?? FacilityEnum.KEEP_ORIGINAL,
            priority: policyData.priority ?? PriorityEnum.INFO,
            flowLevel: policyData.flowLevel ?? FlowLevelEnum.CLIENT_FLOW,
            venues: policyData.venues ?? []
          }
        }
      })
      setOriginalName(policyData.name)
      form.setFieldValue('policyName', policyData.name ?? '')
      form.setFieldValue('server', policyData.primary.server ?? '')
      form.setFieldValue('port', policyData.primary.port ?? 514)
      form.setFieldValue('protocol', policyData.primary.protocol ?? ProtocolEnum.UDP)
      form.setFieldValue('secondaryServer', policyData.secondary?.server ?? '')
      form.setFieldValue('secondaryPort', policyData.secondary?.port ?? 514)
      form.setFieldValue('secondaryProtocol', policyData.secondary?.protocol ?? ProtocolEnum.TCP)
      form.setFieldValue('facility', policyData.facility ?? FacilityEnum.KEEP_ORIGINAL)
      form.setFieldValue('flowLevel', policyData.flowLevel ?? FlowLevelEnum.CLIENT_FLOW)
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

  const handlePort = (port: number) => {
    dispatch({
      type: SyslogActionTypes.PORT,
      payload: {
        port: port
      }
    })
  }

  const handleProtocol = (protocol: ProtocolEnum) => {
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

  const handleSecondaryPort = (port: number) => {
    dispatch({
      type: SyslogActionTypes.SECONDARYPORT,
      payload: {
        secondaryPort: port
      }
    })
  }

  const handleSecondaryProtocol = (protocol: ProtocolEnum) => {
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

  const handleFacility = (facility: FacilityEnum) => {
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
      style={{ width: '380px' }}
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

  const handleFlowLevel = (flowLevel: FlowLevelEnum) => {
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
      style={{ width: '380px' }}
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
            { max: 32 },
            { validator: async (rule, value) => {
              if (!edit && value
                  && data?.findIndex((policy) => policy.name === value) !== -1) {
                return Promise.reject(
                  $t({ defaultMessage: 'The syslog server with that name already exists' })
                )
              }
              if (edit && value && value !== originalName
                  && data?.filter((policy) => policy.name !== originalName)
                    .findIndex((policy) => policy.name === value) !== -1) {
                return Promise.reject(
                  $t({ defaultMessage: 'The syslog server with that name already exists' })
                )
              }
              return servicePolicyNameRegExp(value)
            } }
          ]}
          validateFirst
          hasFeedback
          initialValue={state.policyName}
          children={<Input
            data-testid='name'
            style={{ width: '380px' }}
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
                { type: 'number', min: 1 },
                { type: 'number', max: 65535 }
              ]}
              initialValue={514}
              children={<InputNumber
                data-testid='port'
                min={1}
                max={65535}
                onChange={handlePort}/>}
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
                { type: 'number', min: 1 },
                { type: 'number', max: 65535 }
              ]}
              initialValue={514}
              children={<InputNumber
                data-testid='port2'
                min={1}
                max={65535}
                onChange={handleSecondaryPort}/>}
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
