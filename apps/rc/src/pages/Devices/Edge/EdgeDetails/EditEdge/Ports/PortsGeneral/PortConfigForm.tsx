import { useLayoutEffect } from 'react'

import { Col, Form, Input, Radio, Row, Select, Space, Switch } from 'antd'
import { useIntl }                                             from 'react-intl'

import { StepsForm }                                                                             from '@acx-ui/components'
import { EdgeIpModeEnum, EdgePort, EdgePortTypeEnum, serverIpAddressRegExp, subnetMaskIpRegExp } from '@acx-ui/rc/utils'
import { getIntl, validationMessages }                                                           from '@acx-ui/utils'

import * as UI from '../styledComponents'

import { PortConfigFormType } from '.'

export interface EdgePortWithStatus extends EdgePort {
  statusIp: string
}

interface ConfigFormProps {
  index: number
}

async function lanPortIpValidator (
  value: string,
  lanPorts: string[]
) {
  const { $t } = getIntl()
  if (!lanPorts.includes(value)) return

  const entityName = $t({ defaultMessage: 'Lan Port' })
  return Promise.reject($t(validationMessages.duplication, {
    entityName: entityName,
    key: $t({ defaultMessage: 'ip' }),
    extra: ''
  }))
}

const { useWatch, useFormInstance } = Form

export const PortConfigForm = (props: ConfigFormProps) => {

  const { index } = props

  const { $t } = useIntl()
  const form = useFormInstance<PortConfigFormType>()
  const mac = useWatch([`port_${index}`, 'mac'])
  const portType = useWatch([`port_${index}`, 'portType'])
  const enabled = useWatch([`port_${index}`, 'enabled'])
  const ipMode = useWatch([`port_${index}`, 'ipMode'])
  const statusIp = useWatch([`port_${index}`, 'statusIp'])

  useLayoutEffect(() => {
    form.validateFields()
  }, [mac, form])

  const portTypeOptions = [
    {
      label: $t({ defaultMessage: 'Select port type..' }),
      value: EdgePortTypeEnum.UNCONFIGURED
    },
    {
      label: $t({ defaultMessage: 'WAN' }),
      value: EdgePortTypeEnum.WAN
    },
    {
      label: $t({ defaultMessage: 'LAN' }),
      value: EdgePortTypeEnum.LAN
    }
  ]

  const getLanPortIpsWithoutCurrent = () => {
    return Object.entries<EdgePortWithStatus>(form.getFieldsValue(true))
      .filter(item => item[0] !== `port_${index}` && item[1].portType === EdgePortTypeEnum.LAN)
      .map(item => item[1].ip)
  }

  const getFieldsByPortType = (portType: EdgePortTypeEnum) => {
    if(portType === EdgePortTypeEnum.LAN) {
      return (
        <>
          <Form.Item
            name='ip'
            label={$t({ defaultMessage: 'IP Address' })}
            rules={[
              { required: true },
              { validator: (_, value) => serverIpAddressRegExp(value) },
              { validator: (_, value) => lanPortIpValidator(value, getLanPortIpsWithoutCurrent()) }
            ]}
            children={<Input />}
          />
          <Form.Item
            name='subnet'
            label={$t({ defaultMessage: 'Subnet Mask' })}
            rules={[
              { required: true },
              { validator: (_, value) => subnetMaskIpRegExp(value) }
            ]}
            children={<Input />}
          />
        </>
      )
    } else if(portType === EdgePortTypeEnum.WAN) {
      return (
        <>
          <Form.Item
            name='ipMode'
            label={$t({ defaultMessage: 'IP Assignment' })}
            rules={[{
              required: true
            }]}
            children={
              <Radio.Group>
                <Space direction='vertical'>
                  <Radio value={EdgeIpModeEnum.DHCP}>
                    {$t({ defaultMessage: 'DHCP' })}
                  </Radio>
                  <Radio value={EdgeIpModeEnum.STATIC}>
                    {$t({ defaultMessage: 'Static/Manual' })}
                  </Radio>
                </Space>
              </Radio.Group>
            }
          />
          {ipMode === EdgeIpModeEnum.STATIC &&
            <>
              <Form.Item
                name='ip'
                label={$t({ defaultMessage: 'IP Address' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => serverIpAddressRegExp(value) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name='subnet'
                label={$t({ defaultMessage: 'Subnet Mask' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => subnetMaskIpRegExp(value) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name='gateway'
                label={$t({ defaultMessage: 'Gateway' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => serverIpAddressRegExp(value) }
                ]}
                children={<Input />}
              />
            </>
          }
          <StepsForm.FieldLabel width='120px'>
            {$t({ defaultMessage: 'Use NAT Service' })}
            <Form.Item
              name='natEnabled'
              valuePropName='checked'
              children={<Switch />}
            />
          </StepsForm.FieldLabel>
        </>
      )
    }
    return null
  }

  return (
    <>
      <UI.IpAndMac>
        {

          $t(
            { defaultMessage: 'IP Address: {ip}   |   MAC Address: {mac}' },
            { ip: statusIp ?? 'N/A', mac: mac }
          )
        }
      </UI.IpAndMac>
      <Row gutter={20}>
        <Col span={5}>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Port Name' })}
            rules={[
              { max: 64 }
            ]}
            children={<Input />}
          />
          <Form.Item
            name='portType'
            label={$t({ defaultMessage: 'Port Type' })}
            initialValue={EdgePortTypeEnum.UNCONFIGURED}
            children={
              <Select
                options={portTypeOptions}
              />
            }
          />
          {(portType === EdgePortTypeEnum.LAN || portType === EdgePortTypeEnum.WAN) &&
                <>
                  <StepsForm.FieldLabel width='120px'>
                    {$t({ defaultMessage: 'Port Enabled' })}
                    <Form.Item
                      name='enabled'
                      valuePropName='checked'
                      children={<Switch />}
                    />
                  </StepsForm.FieldLabel>
                  {enabled &&
                    <>
                      <StepsForm.Title>{$t({ defaultMessage: 'IP Settings' })}</StepsForm.Title>
                      {getFieldsByPortType(portType)}
                    </>
                  }
                </>
          }
        </Col>
      </Row>
    </>
  )
}