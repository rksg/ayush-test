import { useCallback, useLayoutEffect } from 'react'

import {
  Checkbox,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Switch
} from 'antd'
import TextArea    from 'antd/lib/input/TextArea'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { StepsFormLegacy, Tooltip } from '@acx-ui/components'
import {
  EdgeIpModeEnum,
  EdgePortWithStatus,
  EdgePortTypeEnum,
  serverIpAddressRegExp,
  subnetMaskIpRegExp,
  edgePortIpValidator,
  getEdgePortTypeOptions
} from '@acx-ui/rc/utils'

import * as UI                                                                               from './styledComponents'
import { getEnabledCorePortMac, getInnerPortFormID, isWANPortExist, lanPortsubnetValidator } from './utils'

import { EdgePortConfigFormType } from '.'

interface ConfigFormProps {
  formListKey: number
  id: string
  isEdgeSdLanRun: boolean
}

const { useWatch, useFormInstance } = Form

export const PortConfigForm = (props: ConfigFormProps) => {
  const { id, formListKey, isEdgeSdLanRun } = props
  const { $t } = useIntl()
  const form = useFormInstance<EdgePortConfigFormType>()
  const portTypeOptions = getEdgePortTypeOptions($t)
  const allValues = form.getFieldsValue(true) as EdgePortConfigFormType

  const getFieldPath = useCallback((fieldName: string) =>
    [formListKey, fieldName],
  [formListKey])

  const getFieldFullPath = useCallback((fieldName: string) =>
    [getInnerPortFormID(id), ...getFieldPath(fieldName)],
  [id, getFieldPath])

  const statusIp = useWatch(getFieldFullPath('statusIp'), form)
  const mac = useWatch(getFieldFullPath('mac'), form)
  const portType = useWatch(getFieldFullPath('portType'), form)
  const portEnabled = useWatch(getFieldFullPath('enabled'), form)
  useWatch(getFieldFullPath('corePortEnabled'), form)

  const corePortMac = getEnabledCorePortMac(form)
  const hasCorePortEnabled = !!corePortMac
  const isCurrentPortCorePortEnabled = corePortMac === mac

  // corePort should be grey-out when one of the following NOT matches :
  // - enabled WAN port cannot exist and current LAN port is core port
  //    (user should be able to unset core port)
  // if SD-LAN enable on this edge
  //     - corePort is exist(physical port might be unplugged by user)
  // else
  //     - only allowed 1 core port enabled
  //     - must be LAN port type
  const isCorePortDisabled = (isWANPortExist(allValues) && !isCurrentPortCorePortEnabled)
   || (isEdgeSdLanRun
     ? hasCorePortEnabled
   // eslint-disable-next-line max-len
     : ((hasCorePortEnabled && !isCurrentPortCorePortEnabled) || portType !== EdgePortTypeEnum.LAN))

  useLayoutEffect(() => {
    form.validateFields()
  }, [mac, form])

  const getCurrentSubnetInfo = () => {
    return {
      ip: form.getFieldValue(getFieldFullPath('ip')),
      subnetMask: form.getFieldValue(getFieldFullPath('subnet'))
    }
  }

  const getSubnetInfoWithoutCurrent = () => {
    return Object.entries<EdgePortWithStatus[]>(form.getFieldsValue(true))
      .filter(item => item[0] !== getInnerPortFormID(id)
        && _.get(item[1], getFieldPath('enabled'))
        && !!_.get(item[1], getFieldPath('ip'))
        && !!_.get(item[1], getFieldPath('subnet')))
      .map(item => ({
        ip: _.get(item[1], getFieldPath('ip')),
        subnetMask: _.get(item[1], getFieldPath('subnet'))
      }))
  }

  const getFieldsByPortType = (portType: EdgePortTypeEnum, ipMode: EdgeIpModeEnum) => {
    if(portType === EdgePortTypeEnum.LAN && isCurrentPortCorePortEnabled === false) {
      return (
        <>
          <Form.Item
            name={getFieldPath('ip')}
            label={$t({ defaultMessage: 'IP Address' })}
            validateFirst
            rules={[
              { required: true },
              { validator: (_, value) =>
                edgePortIpValidator(value, getCurrentSubnetInfo().subnetMask)
              },
              {
                validator: () =>
                  lanPortsubnetValidator(getCurrentSubnetInfo(), getSubnetInfoWithoutCurrent())
              }
            ]}
            children={<Input />}
          />
          <Form.Item
            name={getFieldPath('subnet')}
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
    } else if (portType === EdgePortTypeEnum.WAN
      // only core port enabled LAN port can configure `ipMode`
      || (portType === EdgePortTypeEnum.LAN && isCurrentPortCorePortEnabled)) {
      return (
        <>
          <Form.Item
            name={getFieldPath('ipMode')}
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
                name={getFieldPath('ip')}
                label={$t({ defaultMessage: 'IP Address' })}
                validateFirst
                rules={[
                  { required: true },
                  { validator: (_, value) =>
                    edgePortIpValidator(value, getCurrentSubnetInfo().subnetMask)
                  },
                  {
                    validator: () =>
                      lanPortsubnetValidator(getCurrentSubnetInfo(), getSubnetInfoWithoutCurrent())
                  }
                ]}
                children={<Input />}
              />
              <Form.Item
                name={getFieldPath('subnet')}
                label={$t({ defaultMessage: 'Subnet Mask' })}
                validateFirst
                rules={[
                  { required: true },
                  { validator: (_, value) => subnetMaskIpRegExp(value) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name={getFieldPath('gateway')}
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
          { // only WAN port can configure NAT enable
            portType === EdgePortTypeEnum.WAN &&
            <StepsFormLegacy.FieldLabel width='120px'>
              {$t({ defaultMessage: 'Use NAT Service' })}
              <Form.Item
                name={getFieldPath('natEnabled')}
                valuePropName='checked'
                children={<Switch />}
              />
            </StepsFormLegacy.FieldLabel>
          }
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
            { ip: statusIp || 'N/A', mac: mac }
          )
        }
      </UI.IpAndMac>
      <Row gutter={20}>
        <Col span={5}>
          <Form.Item
            name={getFieldPath('name')}
            label={$t({ defaultMessage: 'Description' })}
            rules={[
              { max: 63 }
            ]}
            children={<TextArea />}
          />
          <Form.Item
            name={getFieldPath('portType')}
            label={$t({ defaultMessage: 'Port Type' })}
          >
            <Select>
              {portTypeOptions.map((item) => {
                return <Select.Option
                  key={item.value}
                  value={item.value}
                  disabled={hasCorePortEnabled && item.value === EdgePortTypeEnum.WAN}
                >
                  {item.label}
                </Select.Option>
              })}
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => {
              return _.get(prev, getFieldFullPath('ipMode'))
                !== _.get(cur, getFieldFullPath('ipMode'))
            }}
          >
            {({ getFieldValue }) => {
              const _portType = getFieldValue(getFieldFullPath('portType'))
              const _ipMode = getFieldValue(getFieldFullPath('ipMode'))

              return (_portType === EdgePortTypeEnum.LAN || _portType === EdgePortTypeEnum.WAN) ? (
                <>
                  {_portType === EdgePortTypeEnum.LAN &&
                    <Form.Item
                      name={getFieldPath('corePortEnabled')}
                      valuePropName='checked'
                    >
                      <Checkbox
                        disabled={isCorePortDisabled}
                      >
                        {$t({ defaultMessage: 'Use this port as Core Port' })}
                        <Tooltip
                          placement='topRight'
                          title={
                            // eslint-disable-next-line max-len
                            // TODO: still waiting for PLM
                            $t({ defaultMessage: 'core port' })
                          }
                        >
                          <UI.StyledQuestionIcon />
                        </Tooltip>
                      </Checkbox>
                    </Form.Item>
                  }
                  <StepsFormLegacy.FieldLabel width='120px'>
                    {$t({ defaultMessage: 'Port Enabled' })}
                    <Form.Item
                      name={getFieldPath('enabled')}
                      valuePropName='checked'
                      // Not allow to enable WAN port when core port exist
                      children={<Switch
                        disabled={hasCorePortEnabled
                          ? !portEnabled && portType === EdgePortTypeEnum.WAN
                          : false} />
                      }
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
