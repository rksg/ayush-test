import { useCallback, useLayoutEffect } from 'react'

import { Col, Form, Input, Radio, Row, Select, Space, Switch } from 'antd'
import TextArea                                                from 'antd/lib/input/TextArea'
import _                                                       from 'lodash'
import { useIntl }                                             from 'react-intl'

import { StepsFormLegacy }                                                                                        from '@acx-ui/components'
import { EdgeIpModeEnum, EdgePort, EdgePortTypeEnum, isSubnetOverlap, serverIpAddressRegExp, subnetMaskIpRegExp } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import { PortConfigFormType } from '.'

export interface EdgePortWithStatus extends EdgePort {
  statusIp: string
}

interface ConfigFormProps {
  name: number
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

  const { index, name } = props

  const { $t } = useIntl()
  const form = useFormInstance<PortConfigFormType>()
  const getFieldFullPath = useCallback((fieldName: string) =>
    [`port_${index}`, name, fieldName], [index, name])

  // const statusIp = useWatch([`port_${index}`, name, 'statusIp'], form)
  // const mac = useWatch([`port_${index}`, name, 'mac'], form)
  const statusIp = useWatch(getFieldFullPath('statusIp'), form)
  const mac = useWatch(getFieldFullPath('mac'), form)

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
      ip: form.getFieldValue(getFieldFullPath('ip')),
      subnetMask: form.getFieldValue(getFieldFullPath('subnet'))
    }
  }

  const getSubnetInfoWithoutCurrent = () => {
    return Object.entries<EdgePortWithStatus[]>(form.getFieldsValue(true))
      .filter(item => item[0] !== `port_${index}`
        && item[1][name].enabled
        && !!item[1][name].ip
        && !!item[1][name].subnet)
      .map(item => ({ ip: item[1][name].ip, subnetMask: item[1][name].subnet }))
  }

  const getFieldsByPortType = (portType: EdgePortTypeEnum, ipMode: EdgeIpModeEnum) => {
    if(portType === EdgePortTypeEnum.LAN) {
      return (
        <>
          <Form.Item
            name={[name,'ip']}
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
            name={[name,'subnet']}
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
            name={[name,'ipMode']}
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
                name={[name,'ip']}
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
                name={[name,'subnet']}
                label={$t({ defaultMessage: 'Subnet Mask' })}
                validateFirst
                rules={[
                  { required: true },
                  { validator: (_, value) => subnetMaskIpRegExp(value) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name={[name,'gateway']}
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
              name={[name,'natEnabled']}
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
            name={[name, 'name']}
            label={$t({ defaultMessage: 'Description' })}
            rules={[
              { max: 255 }
            ]}
            children={<TextArea />}
          />
          <Form.Item
            name={[name, 'portType']}
            label={$t({ defaultMessage: 'Port Type' })}
            children={
              <Select
                options={portTypeOptions}
              />
            }
          />
          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => {
              return _.get(prev, getFieldFullPath('portType'))
                !== _.get(cur, getFieldFullPath('portType'))
                || _.get(prev, getFieldFullPath('ipMode'))
                !== _.get(cur, getFieldFullPath('ipMode'))
            }}
          >
            {({ getFieldValue }) => {
              const _portType = getFieldValue(getFieldFullPath('portType'))
              const _ipMode = getFieldValue(getFieldFullPath('ipMode'))
              return (_portType === EdgePortTypeEnum.LAN || _portType === EdgePortTypeEnum.WAN) ? (
                <>
                  <StepsFormLegacy.FieldLabel width='120px'>
                    {$t({ defaultMessage: 'Port Enabled' })}
                    <Form.Item
                      name={[name, 'enabled']}
                      valuePropName='checked'
                      children={<Switch />}
                    />
                  </StepsFormLegacy.FieldLabel>
                  <StepsFormLegacy.Title children={$t({ defaultMessage: 'IP Settings' })} />
                  {getFieldsByPortType(_portType, _ipMode)}
                </>): null
            }}
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
