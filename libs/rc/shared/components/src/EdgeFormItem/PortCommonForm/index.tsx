import { useCallback, useLayoutEffect } from 'react'

import { Checkbox, Form, FormInstance, FormItemProps, Input, Radio, Select, Space, Switch } from 'antd'
import _                                                                                    from 'lodash'
import { useIntl }                                                                          from 'react-intl'

import { StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { Features }                 from '@acx-ui/feature-toggle'
import {
  EdgeClusterStatus,
  EdgeIpModeEnum,
  EdgeLag,
  EdgePort,
  EdgePortTypeEnum,
  edgePortIpValidator,
  getEdgePortTypeOptions,
  getEdgeWanInterfaces,
  interfaceSubnetValidator,
  serverIpAddressRegExp,
  subnetMaskIpRegExp,
  validateGatewayInSubnet
} from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady }  from '../../useEdgeActions'
import { getEnabledCorePortInfo } from '../EdgePortsGeneralBase/utils'

import { EdgeNatFormItems }    from './NatFormItems'
import * as UI                 from './styledComponents'
import { formFieldsPropsType } from './types'

export interface EdgePortCommonFormProps {
  formRef: FormInstance,
  fieldHeadPath?: string[],
  portsDataRootPath?: string[],
  portsData: EdgePort[],
  lagData?: EdgeLag[],
  isEdgeSdLanRun: boolean,
  isListForm?: boolean,
  formListItemKey?: string,
  formFieldsProps?: formFieldsPropsType
  subnetInfoForValidation?: { id: string | number | undefined, ip: string, subnetMask: string } []
  clusterInfo: EdgeClusterStatus
}

const { useWatch } = Form
export const EdgePortCommonForm = (props: EdgePortCommonFormProps) => {
  const {
    formRef: form,
    fieldHeadPath = [],
    isEdgeSdLanRun,
    portsData,
    lagData,
    isListForm = true,
    formListItemKey = '0',
    formFieldsProps,
    subnetInfoForValidation = [],
    clusterInfo
  } = props
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
  const { $t } = useIntl()
  const portTypeOptions = getEdgePortTypeOptions($t)

  const getFieldPathBaseFormList = useCallback((fieldName: string) => {
    return isListForm
      ? [formListItemKey, fieldName]
      : [fieldName]
  }, [isListForm, formListItemKey])

  // already includes `formListItemKey`
  const getFieldFullPath = useCallback((fieldName: string) => {
    return isListForm
      ? [...fieldHeadPath, fieldName]
      : [fieldName]
  }, [isListForm, fieldHeadPath])

  const id = useWatch(getFieldFullPath('id'), form)
  const mac = useWatch(getFieldFullPath('mac'), form)
  const portType = useWatch(getFieldFullPath('portType'), form)
  // eslint-disable-next-line max-len
  const portEnabled = useWatch(getFieldFullPath((_.get(formFieldsProps, 'enabled')?.name as string) ?? 'enabled'), form)
  const corePortEnabled = useWatch(getFieldFullPath('corePortEnabled'), form)
  const accessPortEnabled = useWatch(getFieldFullPath('accessPortEnabled'), form)

  const corePortInfo = getEnabledCorePortInfo(portsData, lagData || [])
  const hasCorePortEnabled = !!corePortInfo.key
  const existingLagMember = lagData?.flatMap(lag => lag.lagMembers
    ?.map(member => member?.portId)) ?? []

  // 1. when the corePort is joined as lagMember, will ignore all the grey-out rule
  // 2. corePort should be grey-out when one of the following NOT matches :
  //     - enabled WAN port cannot exist and current LAN port is core port
  //       (user should be able to unset core port)
  //    if SD-LAN enable on this edge
  //     - corePort is exist(physical port might be unplugged by user)
  //    else
  //     - only allowed 1 core port enabled
  //     - must be LAN port type
  const wanPortsInfo = getEdgeWanInterfaces(portsData, lagData || [])

  const isExistingWanPortInLagMember = existingLagMember.some(lagMember =>
    wanPortsInfo.find(wan => (wan as EdgePort).id === lagMember)) ?? false

  const hasWANPort = wanPortsInfo.length > 0 && !isExistingWanPortInLagMember

  const hasCorePortLimitation = !corePortInfo.isExistingCorePortInLagMember && hasCorePortEnabled

  const getCurrentSubnetInfo = () => {
    return {
      ipMode: form.getFieldValue(getFieldFullPath('ipMode')),
      ip: form.getFieldValue(getFieldFullPath('ip')),
      subnetMask: form.getFieldValue(getFieldFullPath('subnet'))
    }
  }

  const getFieldsByPortType = (portType: EdgePortTypeEnum, ipMode: EdgeIpModeEnum) => {
    const isIpModeVisible = portType === EdgePortTypeEnum.WAN
      || portType === EdgePortTypeEnum.CLUSTER
      || (portType === EdgePortTypeEnum.LAN && (corePortEnabled || accessPortEnabled))
    const isIpSubnetVisible = (portType !== EdgePortTypeEnum.UNCONFIGURED
      && ipMode === EdgeIpModeEnum.STATIC)
      // Ensures that IP subnet fields appear immediately when switching IP mode,
      // preventing a delayed UI update when toggling between DHCP and Static modes.
      || (portType === EdgePortTypeEnum.LAN && !corePortEnabled && !accessPortEnabled)
    const isGatewayVisible = (
      portType === EdgePortTypeEnum.WAN
      || (portType === EdgePortTypeEnum.LAN
        && (isEdgeCoreAccessSeparationReady ? accessPortEnabled : corePortEnabled)))
      && ipMode === EdgeIpModeEnum.STATIC
    const isNatItemsVisible = portType === EdgePortTypeEnum.WAN

    return (
      <>
        {
          isIpModeVisible &&
          <Form.Item
            name={getFieldPathBaseFormList('ipMode')}
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
        }
        {
          isIpSubnetVisible && <>
            <Form.Item
              name={getFieldPathBaseFormList('ip')}
              label={$t({ defaultMessage: 'IP Address' })}
              validateFirst
              rules={[
                { required: true },
                { validator: (_, value) =>
                  edgePortIpValidator(value, getCurrentSubnetInfo().subnetMask)
                },
                {
                  validator: () =>
                  // eslint-disable-next-line max-len
                    interfaceSubnetValidator(
                      getCurrentSubnetInfo(),
                      // eslint-disable-next-line max-len
                      subnetInfoForValidation.filter(item => item.id !== id && !existingLagMember.includes(item.id + ''))
                    )
                }
              ]}
              {..._.get(formFieldsProps, 'ip')}
              children={<Input />}
            />
            <Form.Item
              name={getFieldPathBaseFormList('subnet')}
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
        }
        {
          isGatewayVisible &&
          <Form.Item
            name={getFieldPathBaseFormList('gateway')}
            label={$t({ defaultMessage: 'Gateway' })}
            validateFirst
            rules={[
              { required: true },
              { validator: (_, value) => serverIpAddressRegExp(value) },
              {
                validator: (_, value) => {
                  let subnet = getCurrentSubnetInfo()
                  return validateGatewayInSubnet(subnet.ip, subnet.subnetMask, value)
                }
              }
            ]}
            {..._.get(formFieldsProps, 'gateway')}
            children={<Input />}
          />
        }
        {
          isNatItemsVisible &&
          <EdgeNatFormItems
            parentNamePath={getFieldPathBaseFormList('').slice(0, -1)}
            getFieldFullPath={getFieldFullPath}
            formFieldsProps={formFieldsProps}
            clusterInfo={clusterInfo}
            portsData={portsData}
            lagData={lagData}
          />
        }
      </>
    )
  }

  useLayoutEffect(() => {
    form.validateFields()
  }, [mac, form])

  return <>
    <Form.Item
      name={getFieldPathBaseFormList('portType')}
      label={$t({ defaultMessage: 'Port Type' })}
      {..._.omit(_.get(formFieldsProps, 'portType'), 'rules')}
      dependencies={['ipMode', 'enabled', 'corePortEnabled']}
      validateFirst
      rules={[
        { required: true },
        { validator: (_, value) => {
          if (hasCorePortLimitation
              && portEnabled
              && value === EdgePortTypeEnum.WAN ) {
            return Promise.reject(
              $t({ defaultMessage: 'WAN port cannot be used when Core Port exist' })
            )
          } else {
            return Promise.resolve()
          }
        } },
        ...(_.get(formFieldsProps, 'portType.rules') as FormItemProps['rules'] ?? [])
      ]}
    >
      <Select disabled={_.get(formFieldsProps, 'portType')?.disabled}>
        {(_.get(formFieldsProps, 'portType')?.options ?? portTypeOptions).map((item) => {
          return <Select.Option
            key={item.value}
            value={item.value}
            disabled={hasCorePortLimitation && item.value === EdgePortTypeEnum.WAN}
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
              {
                _portType === EdgePortTypeEnum.LAN && (isEdgeCoreAccessSeparationReady ?
                  <Form.Item
                    label={$t({ defaultMessage: 'Use port as…' })}
                    children={
                      <Space direction='vertical'>
                        <Form.Item
                          name={getFieldPathBaseFormList('corePortEnabled')}
                          valuePropName='checked'
                          noStyle
                        >
                          <Checkbox
                            children={$t({ defaultMessage: 'Core port' })}
                          />
                        </Form.Item>
                        <Form.Item
                          name={getFieldPathBaseFormList('accessPortEnabled')}
                          valuePropName='checked'
                          noStyle
                        >
                          <Checkbox
                            children={$t({ defaultMessage: 'Access port' })}
                          />
                        </Form.Item>
                      </Space>
                    }
                  /> :
                  <Form.Item
                    name={getFieldPathBaseFormList('corePortEnabled')}
                    valuePropName='checked'
                    {..._.get(formFieldsProps, 'corePortEnabled')}
                  >
                    <Checkbox
                      disabled={!corePortInfo.isExistingCorePortInLagMember
                        && (
                          (hasWANPort && !corePortEnabled)
                          || (isEdgeSdLanRun
                            ? hasCorePortEnabled
                            // eslint-disable-next-line max-len
                            : ((hasCorePortEnabled && !corePortEnabled) || portType !== EdgePortTypeEnum.LAN))
                        )
                      }
                    >
                      {
                        // eslint-disable-next-line max-len
                        _.get(formFieldsProps, 'corePortEnabled')?.title ?? $t({ defaultMessage: 'Use this port as Core Port' })
                      }

                      <Tooltip
                        placement='topRight'
                        title={
                          // eslint-disable-next-line max-len
                          $t({ defaultMessage: 'Utilized for SD-LAN service, the core port on this RUCKUS Edge establishes tunnels for directing data traffic effectively' })
                        }
                      >
                        <UI.StyledQuestionIcon />
                      </Tooltip>
                    </Checkbox>
                  </Form.Item>)
              }
              <StepsFormLegacy.FieldLabel width='120px'>
                {
                  _.get(formFieldsProps, 'enabled')?.title ?? $t({ defaultMessage: 'Port Enabled' })
                }
                <Form.Item
                  name={getFieldPathBaseFormList('enabled')}
                  valuePropName='checked'
                  {..._.get(formFieldsProps, 'enabled')}
                  // Not allow to enable WAN port when core port exist
                  children={<Switch
                    disabled={hasCorePortLimitation
                      && !portEnabled
                      && portType === EdgePortTypeEnum.WAN
                    } />
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