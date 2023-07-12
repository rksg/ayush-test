import { useLayoutEffect } from 'react'

import { Col, Form, Input, Radio, Row, Select, Space, Switch } from 'antd'
import { useIntl }                                             from 'react-intl'

import { StepsFormLegacy }                                                                                        from '@acx-ui/components'
import { EdgeIpModeEnum, EdgePort, EdgePortTypeEnum, isSubnetOverlap, serverIpAddressRegExp, subnetMaskIpRegExp } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import { PortConfigFormType } from '.'

export interface EdgePortWithStatus extends EdgePort {
  statusIp: string
}

interface ConfigFormProps {
  index: number
}

export async function lanPortsubnetValidator (
  currentSubnet: { ip: string, subnetMask: string },
  allSubnetWithoutCurrent: { ip: string, subnetMask: string } []
) {
  if(!!!currentSubnet.ip || !!!currentSubnet.subnetMask) {
    return
  }

  for(let item of allSubnetWithoutCurrent) {
    try {
      await isSubnetOverlap(currentSubnet.ip, currentSubnet.subnetMask,
        item.ip, item.subnetMask)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  return Promise.resolve()
}

const { useWatch, useFormInstance } = Form

export const PortConfigForm = (props: ConfigFormProps) => {

  const { index } = props

  const { $t } = useIntl()
  const form = useFormInstance<PortConfigFormType>()
  const mac = useWatch([`port_${index}`, 'mac'])
  const portType = useWatch([`port_${index}`, 'portType'])
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

  const getCurrentSubnetInfo = () => {
    return {
      ip: form.getFieldValue([`port_${index}`, 'ip']),
      subnetMask: form.getFieldValue([`port_${index}`, 'subnet'])
    }
  }

  const getSubnetInfoWithoutCurrent = () => {
    return Object.entries<EdgePortWithStatus>(form.getFieldsValue(true))
      .filter(item => item[0] !== `port_${index}`
        && item[1].enabled
        && !!item[1].ip
        && !!item[1].subnet)
      .map(item => ({ ip: item[1].ip, subnetMask: item[1].subnet }))
  }

  const getFieldsByPortType = (portType: EdgePortTypeEnum) => {
    if(portType === EdgePortTypeEnum.LAN) {
      return (
        <>
          <Form.Item
            name='ip'
            label={$t({ defaultMessage: 'IP Address' })}
            validateFirst
            rules={[
              { required: true },
              { validator: (_, value) => serverIpAddressRegExp(value) },
              {
                validator: () =>
                  lanPortsubnetValidator(getCurrentSubnetInfo(), getSubnetInfoWithoutCurrent())
              }
            ]}
            children={<Input />}
          />
          <Form.Item
            name='subnet'
            label={$t({ defaultMessage: 'Subnet Mask' })}
            validateFirst
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
            validateFirst
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
                validateFirst
                rules={[
                  { required: true },
                  { validator: (_, value) => serverIpAddressRegExp(value) },
                  {
                    validator: () =>
                      lanPortsubnetValidator(getCurrentSubnetInfo(), getSubnetInfoWithoutCurrent())
                  }
                ]}
                children={<Input />}
              />
              <Form.Item
                name='subnet'
                label={$t({ defaultMessage: 'Subnet Mask' })}
                validateFirst
                rules={[
                  { required: true },
                  { validator: (_, value) => subnetMaskIpRegExp(value) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name='gateway'
                label={$t({ defaultMessage: 'Gateway' })}
                validateFirst
                rules={[
                  { required: true },
                  { validator: (_, value) => serverIpAddressRegExp(value) }
                ]}
                children={<Input />}
              />
            </>
          }
          <StepsFormLegacy.FieldLabel width='120px'>
            {$t({ defaultMessage: 'Use NAT Service' })}
            <Form.Item
              name='natEnabled'
              valuePropName='checked'
              children={<Switch />}
            />
          </StepsFormLegacy.FieldLabel>
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
                  <StepsFormLegacy.FieldLabel width='120px'>
                    {$t({ defaultMessage: 'Port Enabled' })}
                    <Form.Item
                      name='enabled'
                      valuePropName='checked'
                      children={<Switch />}
                    />
                  </StepsFormLegacy.FieldLabel>
                  <StepsFormLegacy.Title children={$t({ defaultMessage: 'IP Settings' })} />
                  {getFieldsByPortType(portType)}
                </>
          }
        </Col>
      </Row>
    </>
  )
}
