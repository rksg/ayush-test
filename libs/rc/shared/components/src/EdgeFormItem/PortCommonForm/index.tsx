import { useCallback, useLayoutEffect } from 'react'

import { Checkbox, Form, FormInstance, FormItemProps, Input, Radio, Select, Space, Switch } from 'antd'
import _                                                                                    from 'lodash'
import { useIntl }                                                                          from 'react-intl'

import { StepsFormLegacy, Tooltip } from '@acx-ui/components'
import {
  EdgeIpModeEnum,
  EdgeLag,
  EdgePort,
  EdgePortTypeEnum,
  EdgePortWithStatus,
  edgePortIpValidator,
  getEdgePortTypeOptions,
  lanPortsubnetValidator,
  serverIpAddressRegExp,
  subnetMaskIpRegExp
} from '@acx-ui/rc/utils'

import { getEnabledCorePortInfo, getInnerPortFormID, isWANPortExist } from '../EdgePortsGeneral/utils'

import * as UI from './styledComponents'

interface formFieldsPropsType {
  [key: string]: FormItemProps & {
    title?: string,
    options?: {
      label: string,
      value: EdgePortTypeEnum
    }[]
  }
}
interface EdgePortCommonFormProps {
  formRef: FormInstance,
  portsData: EdgePort[],
  lagData?: EdgeLag[],
  isEdgeSdLanRun: boolean,
  isListForm?: boolean,
  formListItemKey?: number,
  formListID?: string,
  formFieldsProps?: formFieldsPropsType
}

const { useWatch } = Form
export const EdgePortCommonForm = (props: EdgePortCommonFormProps) => {
  const {
    formRef: form,
    isEdgeSdLanRun,
    portsData,
    lagData,
    isListForm = true,
    formListItemKey = 0,
    formListID,
    formFieldsProps
  } = props
  const { $t } = useIntl()
  const portTypeOptions = getEdgePortTypeOptions($t)

  const getFieldPath = useCallback((fieldName: string) => {
    return isListForm
      ? [formListItemKey, fieldName]
      : [fieldName]
  }, [isListForm, formListItemKey])

  const getFieldFullPath = useCallback((fieldName: string) => {
    return isListForm
      ? [getInnerPortFormID(formListID!), ...getFieldPath(fieldName)]
      : [fieldName]
  }, [isListForm, formListID, getFieldPath])

  const mac = useWatch(getFieldFullPath('mac'), form)
  const portType = useWatch(getFieldFullPath('portType'), form)
  const portEnabled = useWatch(getFieldFullPath('enabled'), form)

  const lagId = form.getFieldValue(getFieldFullPath('id'))
  const physicalPortIfName = form.getFieldValue(getFieldFullPath('interfaceName'))

  const corePortInfo = getEnabledCorePortInfo(portsData, lagData || [])
  const hasCorePortEnabled = !!corePortInfo.key
  const isCurrentPortCorePortEnabled = (hasCorePortEnabled && (corePortInfo.isLag
    ? corePortInfo.key === (lagId + '')
    : corePortInfo.key === physicalPortIfName))

  // 1. when the corePort is joined as lagMember, will ignore all the grey-out rule
  // 2. corePort should be grey-out when one of the following NOT matches :
  //     - enabled WAN port cannot exist and current LAN port is core port
  //       (user should be able to unset core port)
  //    if SD-LAN enable on this edge
  //     - corePort is exist(physical port might be unplugged by user)
  //    else
  //     - only allowed 1 core port enabled
  //     - must be LAN port type
  const hasWANPort = isWANPortExist(portsData, lagData || [])
  const isCorePortDisabled = corePortInfo.isExistingCorePortInLagMember
    ? false
    : ((hasWANPort && !isCurrentPortCorePortEnabled)
      || (isEdgeSdLanRun
        ? hasCorePortEnabled
        // eslint-disable-next-line max-len
        : ((hasCorePortEnabled && !isCurrentPortCorePortEnabled) || portType !== EdgePortTypeEnum.LAN)))

  const getCurrentSubnetInfo = () => {
    return {
      ip: form.getFieldValue(getFieldFullPath('ip')),
      subnetMask: form.getFieldValue(getFieldFullPath('subnet'))
    }
  }

  const getSubnetInfoWithoutCurrent = () => {
    return Object.entries<EdgePortWithStatus[]>(form.getFieldsValue(true))
      .filter(item => item[0] !== getInnerPortFormID(formListID!)
        && _.get(item[1], getFieldPath('enabled'))
        && !!_.get(item[1], getFieldPath('ip'))
        && !!_.get(item[1], getFieldPath('subnet')))
      .map(item => ({
        ip: _.get(item[1], getFieldPath('ip')),
        subnetMask: _.get(item[1], getFieldPath('subnet'))
      }))
  }

  const getFieldsByPortType = (portType: EdgePortTypeEnum, ipMode: EdgeIpModeEnum) => {
    if(
      (portType === EdgePortTypeEnum.LAN && isCurrentPortCorePortEnabled === false) ||
      portType === EdgePortTypeEnum.CLUSTER
    ) {
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
            {..._.get(formFieldsProps, 'ip')}
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
            {..._.get(formFieldsProps, 'subnet')}
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
            {..._.get(formFieldsProps, 'ipMode')}
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
                {..._.get(formFieldsProps, 'ip')}
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
                {..._.get(formFieldsProps, 'subnet')}
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
                {..._.get(formFieldsProps, 'gateway')}
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
                {..._.get(formFieldsProps, 'natEnabled')}
                children={<Switch />}
              />
            </StepsFormLegacy.FieldLabel>
          }
        </>
      )
    }
    return null
  }

  useLayoutEffect(() => {
    form.validateFields()
  }, [mac, form])

  return <>
    <Form.Item
      name={getFieldPath('portType')}
      label={$t({ defaultMessage: 'Port Type' })}
      {..._.get(formFieldsProps, 'portType')}
    >
      <Select>
        {(_.get(formFieldsProps, 'portType')?.options ?? portTypeOptions).map((item) => {
          return <Select.Option
            key={item.value}
            value={item.value}
            disabled={corePortInfo.isExistingCorePortInLagMember
              ? false
              : (hasCorePortEnabled && item.value === EdgePortTypeEnum.WAN)}
          >
            {item.label}
          </Select.Option>
        })}
      </Select>
    </Form.Item>
    <Form.Item
      noStyle
      shouldUpdate={true}
    >
      {({ getFieldValue }) => {
        const _portType = getFieldValue(getFieldFullPath('portType'))
        const _ipMode = getFieldValue(getFieldFullPath('ipMode'))

        return (
          _portType === EdgePortTypeEnum.LAN ||
          _portType === EdgePortTypeEnum.WAN ||
          _portType === EdgePortTypeEnum.CLUSTER
        ) ? (
            <>
              {_portType === EdgePortTypeEnum.LAN &&
                <Form.Item
                  name={getFieldPath('corePortEnabled')}
                  valuePropName='checked'
                  {..._.get(formFieldsProps, 'corePortEnabled')}
                >
                  <Checkbox
                    disabled={isCorePortDisabled}
                  >
                    {
                      // eslint-disable-next-line max-len
                      _.get(formFieldsProps, 'corePortEnabled')?.title ?? $t({ defaultMessage: 'Use this port as Core Port' })
                    }

                    <Tooltip
                      placement='topRight'
                      title={
                        // eslint-disable-next-line max-len
                        $t({ defaultMessage: 'Utilized for SD-LAN service, the core port on this SmartEdge establishes tunnels for directing data traffic effectively' })
                      }
                    >
                      <UI.StyledQuestionIcon />
                    </Tooltip>
                  </Checkbox>
                </Form.Item>
              }
              <StepsFormLegacy.FieldLabel width='120px'>
                {
                  _.get(formFieldsProps, 'enabled')?.title ?? $t({ defaultMessage: 'Port Enabled' })
                }
                <Form.Item
                  name={getFieldPath('enabled')}
                  valuePropName='checked'
                  {..._.get(formFieldsProps, 'enabled')}
                  // Not allow to enable WAN port when core port exist
                  children={<Switch
                    disabled={corePortInfo.isExistingCorePortInLagMember
                      ? false
                      : hasCorePortEnabled
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
  </>
}