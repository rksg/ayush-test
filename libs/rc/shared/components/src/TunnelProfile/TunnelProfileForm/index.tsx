import { useCallback, useEffect, useState } from 'react'

import {
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Space,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { getTitleWithBetaIndicator }                                     from '@acx-ui/components'
import { Features, TierFeatures, useIsBetaEnabled }                      from '@acx-ui/feature-toggle'
import { useGetEdgeClusterListQuery, useGetEdgeClusterServiceListQuery } from '@acx-ui/rc/services'
import {
  AgeTimeUnit,
  EdgeClusterProfileTypeEnum,
  EdgeServiceTypeEnum,
  IncompatibilityFeatures,
  MtuRequestTimeoutUnit,
  MtuTypeEnum,
  NetworkSegmentTypeEnum,
  TunnelTypeEnum,
  serverIpAddressRegExp,
  servicePolicyNameRegExp
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { ApCompatibilityToolTip }                         from '../../ApCompatibility'
import { EdgeCompatibilityDrawer, EdgeCompatibilityType } from '../../Compatibility'
import { useIsEdgeFeatureReady }                          from '../../useEdgeActions'

import { MessageMapping } from './MessageMapping'
import * as UI            from './styledComponents'

const { useWatch } = Form

export const sessionMapping: { [key: string]: number } = {
  week: 1,
  days: 7,
  minutes: 10080
}

async function validateAgeTimeValue (value: number, ageTimeUnit: string) {
  const { $t } = getIntl()
  if (value < (ageTimeUnit === AgeTimeUnit.MINUTES ? 5 : 1) ||
        value > sessionMapping[ageTimeUnit]) {
    return Promise.reject($t({
      defaultMessage: 'Value must between 5-10080 minutes or 1-7 days or 1 week'
    }))
  }
  return Promise.resolve()
}

export const mtuRequestTimeMapping: { [key: string]: number } = {
  seconds: 10,
  milliseconds: 10000
}

async function validateMtuRequestTimeValue (value: number, mtuRequestUnit: string) {
  const { $t } = getIntl()
  if (value < (mtuRequestUnit === MtuRequestTimeoutUnit.SECONDS ? 1 : 10) ||
        value > mtuRequestTimeMapping[mtuRequestUnit]) {
    return Promise.reject($t({
      defaultMessage: 'Value must between 10-10000 milliseconds or 1-10 seconds'
    }))
  }
  return Promise.resolve()
}

interface TunnelProfileFormProps {
  isDefaultTunnelProfile?: boolean
}

const MtuSizeFormItem = (props: { value?: number,
  onChange?: (value: number) => void,
  disabled?:boolean }) => {
  const { $t } = useIntl()
  return <Space>
    <InputNumber {...props} />
    {$t({ defaultMessage: 'bytes' })}
  </Space>
}

export const TunnelProfileForm = (props: TunnelProfileFormProps) => {
  const { isDefaultTunnelProfile = false } = props
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const formId = form.getFieldValue('id')
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeVxLanTunnelKaReady = useIsEdgeFeatureReady(Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE)
  const isEdgePinHaReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeNatTraversalP1Ready = useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE)
  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  const ageTimeUnit = useWatch<AgeTimeUnit>('ageTimeUnit')
  const mtuRequestTimeoutUnit = useWatch<MtuRequestTimeoutUnit>('mtuRequestTimeoutUnit')
  const mtuType = useWatch('mtuType')
  const disabledFields = form.getFieldValue('disabledFields')
  const tunnelType = useWatch('tunnelType')
  const networkSegementType = useWatch('type')
  const isVniType = networkSegementType === NetworkSegmentTypeEnum.VXLAN
  const isL2greType = tunnelType === TunnelTypeEnum.L2GRE
  // eslint-disable-next-line max-len
  const [edgeCompatibilityFeature, setEdgeCompatibilityFeature] = useState<IncompatibilityFeatures | undefined>()

  const ageTimeOptions = [
    { label: $t({ defaultMessage: 'Minute(s)' }), value: AgeTimeUnit.MINUTES },
    { label: $t({ defaultMessage: 'Day(s)' }), value: AgeTimeUnit.DAYS },
    { label: $t({ defaultMessage: 'Week' }), value: AgeTimeUnit.WEEK }
  ]

  const handelAgeTimeUnitChange = () => {
    form.validateFields(['ageTimeMinutes'])
  }

  const mtuRequestTimeoutUnitOptions = [
    { label: $t({ defaultMessage: 'Seconds' }), value: MtuRequestTimeoutUnit.SECONDS },
    { label: $t({ defaultMessage: 'Milliseconds' }), value: MtuRequestTimeoutUnit.MILLISECONDS }
  ]

  // eslint-disable-next-line max-len
  const { clusterServiceData, isLoading: isClusterServiceOptsLoading } = useGetEdgeClusterServiceListQuery(
    { payload: {
      fields: [
        'serviceId',
        'edgeClusterId',
        'serviceType'
      ],
      pageSize: 10000
    } },
    {
      skip: !isEdgeL2greReady,
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterServiceData: data?.data
          ,isLoading
        }
      }
    })

  const inValidClusterIds = clusterServiceData
    ?.filter(item => item.serviceType === EdgeServiceTypeEnum.PIN ||
    item.serviceType === EdgeServiceTypeEnum.MV_SD_LAN ||
    // eslint-disable-next-line max-len
    (item.serviceId !== formId && item.serviceType === EdgeClusterProfileTypeEnum.TUNNEL_PROFILE)).map(item => item.edgeClusterId)

  clusterServiceData
    // eslint-disable-next-line max-len
    ?.filter(item => item.serviceId === formId && item.serviceType === EdgeClusterProfileTypeEnum.TUNNEL_PROFILE)
    .some(item => {
      form.setFieldsValue({ edgeClusterId: item.edgeClusterId })
      return true
    })

  const { clusterData, isLoading: isClusterOptsLoading } = useGetEdgeClusterListQuery(
    { payload: {
      fields: [
        'name',
        'venueId',
        'clusterId',
        'firmwareVersion'
      ],
      pageSize: 10000
    } },
    {
      skip: !isEdgeL2greReady,
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterData: data?.data
            .filter(item => !inValidClusterIds?.includes(item.clusterId!))
          ,isLoading
        }
      }
    })

  const clusterOptions = clusterData?.map(item => ({
    label: item.name,
    value: item.clusterId
  }))

  const handelMtuRequestTimeUnitChange = () => {
    form.validateFields(['mtuRequestTimeout'])
  }

  const handleNetworkSegmentTypeChange = (e: RadioChangeEvent) => {
    if (e.target.value === NetworkSegmentTypeEnum.VXLAN) {
      if (isEdgeNatTraversalP1Ready) {
        form.setFieldsValue({ natTraversalEnabled: false })
      }
      if (isEdgeL2greReady) {
        form.setFieldsValue({ tunnelType: TunnelTypeEnum.VXLAN_GPE })
      }
    }
  }

  const handleTunnelTypeChange = (e: RadioChangeEvent) => {
    if (e.target.value === TunnelTypeEnum.L2GRE) {
      form.setFieldsValue({ mtuType: MtuTypeEnum.MANUAL })
    }
  }

  const onEdgeClusterChange = useCallback((val: string) => {
    const edgeData = clusterData?.filter(i => i.clusterId === val)[0]
    form.setFieldsValue({
      venueId: edgeData?.venueId
    })
  }, [clusterData, form])

  const isNatTraversalBetaEnabled = useIsBetaEnabled(TierFeatures.EDGE_NAT_T)

  useEffect(() => {
    if (form.getFieldValue('edgeClusterId') && clusterData?.length) {
      onEdgeClusterChange(form.getFieldValue('edgeClusterId'))
    }
  }, [form, clusterData, onEdgeClusterChange])

  return (
    <>
      {<Row>
        <Col span={14}>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Profile Name' })}
            rules={[
              { required: true,
                message: $t({ defaultMessage: 'Please enter Profile Name' })
              },
              { min: 2 },
              { max: 32 },
              { validator: (_, value) => servicePolicyNameRegExp(value) }
            ]}
            children={<Input
              disabled={isDefaultTunnelProfile || !!disabledFields?.includes('name')}/>}
            validateFirst
          />
        </Col>
        {/* <Col span={14}>
        <Form.Item
          name='tag'
          label={$t({ defaultMessage: 'Tags' })}
          children={<Select mode='tags' />}
        />
      </Col> */}
        { isEdgeVxLanTunnelKaReady && (isEdgeSdLanReady || isEdgeSdLanHaReady) &&
        <Col span={24}>
          <Form.Item
            name='type'
            label={$t({ defaultMessage: 'Network Segment Type' })}
            initialValue={NetworkSegmentTypeEnum.VLAN_VXLAN}
            tooltip={$t(MessageMapping.tunnel_type_tooltip)}
            children={
              <Radio.Group disabled={isDefaultTunnelProfile
                    || !!disabledFields?.includes('type')}
              onChange={handleNetworkSegmentTypeChange}
              >
                <Space direction='vertical'>
                  <Radio value={NetworkSegmentTypeEnum.VLAN_VXLAN}>
                    {$t({ defaultMessage: 'VLAN to VNI map' })}
                  </Radio>
                  { isEdgePinHaReady &&
                    <Radio value={NetworkSegmentTypeEnum.VXLAN}>
                      {$t({ defaultMessage: 'VNI' })}
                    </Radio>
                  }
                </Space>
              </Radio.Group>
            }
          />
        </Col>
        }
        { isEdgeL2greReady &&
          <Col span={24}>
            <Form.Item
              name='tunnelType'
              label={$t({ defaultMessage: 'Tunnel Type' })}
              initialValue={TunnelTypeEnum.VXLAN_GPE}
              children={
                <Radio.Group
                  disabled={!!disabledFields?.includes('tunnelType')}
                  onChange={handleTunnelTypeChange}
                >
                  <Space direction='vertical'>
                    <Radio value={TunnelTypeEnum.VXLAN_GPE}>
                      {$t({ defaultMessage: 'VxLAN GPE' })}
                    </Radio>
                    <Radio value={TunnelTypeEnum.L2GRE} disabled={isVniType} >
                      {$t({ defaultMessage: 'L2GRE' })}
                    </Radio>
                  </Space>
                </Radio.Group>
              }
            />
          </Col>
        }
        { isEdgeL2greReady && isL2greType &&
          <Col span={14}>
            <Form.Item
              name='destinationIpAddress'
              label={$t({ defaultMessage: 'Destination IP Address' })}
              children={<Input
                disabled={!!disabledFields?.includes('destinationIpAddress')}
              />}
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please enter a valid IP address' })
                },
                {
                  validator: (_, value) => serverIpAddressRegExp(value) }
              ]}
            />
          </Col>
        }
        { isEdgeL2greReady && !!!isL2greType &&
          <Col span={14}>
            <Row>
              <Col>
                <Form.Item
                  name='edgeClusterId'
                  label={<>
                    { $t({ defaultMessage: 'Destination RUCKUS Edge cluster' }) }
                  </>}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please select a Cluster' })
                  }
                  ]}
                >
                  <Select
                    loading={isClusterServiceOptsLoading && isClusterOptsLoading}
                    options={clusterOptions}
                    placeholder={$t({ defaultMessage: 'Select ...' })}
                    onChange={onEdgeClusterChange}
                    disabled={!!disabledFields?.includes('edgeClusterId')}
                  />
                </Form.Item>
              </Col>
              {/* {edgeClusterId &&
            <Col span={24}>
              <ClusterFirmwareInfo
                clusterId={edgeClusterId}
              />
            </Col>
              } */}
            </Row>
          </Col>
        }
        { isEdgeNatTraversalP1Ready &&
        (!isEdgeL2greReady || !!!isL2greType) &&
        <Col span={14}>
          <UI.StyledSpace align='center'>
            <UI.FormItemWrapper>
              <Form.Item
                label={<>
                  {$t({ defaultMessage: 'Enable NAT-T Support' })}
                  { isNatTraversalBetaEnabled ? getTitleWithBetaIndicator('') : null }
                  {<ApCompatibilityToolTip
                    title={$t(MessageMapping.nat_traversal_support_tooltip)}
                    placement='bottom'
                    showDetailButton
                    // eslint-disable-next-line max-len
                    onClick={() => setEdgeCompatibilityFeature(IncompatibilityFeatures.NAT_TRAVERSAL)}
                  />}
                </>}
              />
            </UI.FormItemWrapper>
            <Form.Item
              noStyle
              dependencies={['type']}
            >
              {({ getFieldValue }) => {
                const netSegType = getFieldValue('type')
                return <Form.Item
                  name='natTraversalEnabled'
                  valuePropName='checked'
                  children={
                    <Switch disabled={isDefaultTunnelProfile ||
                      !!disabledFields?.includes('natTraversalEnabled') ||
                      netSegType === NetworkSegmentTypeEnum.VXLAN}/>
                  }
                />
              }}
            </Form.Item>
          </UI.StyledSpace>
        </Col>
        }
        <Col span={24}>
          <Form.Item noStyle dependencies={['tunnelType']}>
            {({ getFieldValue }) => {
              return (isEdgeL2greReady && getFieldValue('tunnelType') === TunnelTypeEnum.L2GRE) ?
                <Form.Item
                  name='mtuSize'
                  label={$t({ defaultMessage: 'Gateway Path MTU' })}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter Path MTU size'
                    },
                    {
                      type: 'number',
                      min: 576,
                      max: 1450,
                      message: $t({
                        defaultMessage: 'Path MTU size must be between 576 and 1450'
                      })
                    }
                  ]}
                  children={<MtuSizeFormItem
                    disabled={!!disabledFields?.includes('mtuSize')}/>}
                  validateFirst
                />
                : <Form.Item
                  name='mtuType'
                  label={$t({ defaultMessage: 'Gateway Path MTU Mode' })}
                  tooltip={$t(MessageMapping.mtu_tooltip)}

                  extra={
                    <Space size={1} style={{ alignItems: 'start', marginTop: 5 }}>
                      {
                        mtuType === MtuTypeEnum.MANUAL
                          ? (<><UI.InfoIcon />
                            { $t(MessageMapping.mtu_help_msg) }</>)
                          : null
                      }
                    </Space>
                  }
                  children={
                    // eslint-disable-next-line max-len
                    <Radio.Group disabled={isDefaultTunnelProfile || !!disabledFields?.includes('mtuType')}>
                      <Space direction='vertical'>
                        <Radio value={MtuTypeEnum.AUTO}>
                          {$t({ defaultMessage: 'Auto' })}
                        </Radio>
                        <Radio value={MtuTypeEnum.MANUAL}>
                          <Space>
                            <div>
                              {$t({ defaultMessage: 'Manual' })}
                            </div>
                            {
                              mtuType === MtuTypeEnum.MANUAL &&
                      <Space>
                        <Form.Item
                          name='mtuSize'
                          rules={[
                            {
                              required: mtuType === MtuTypeEnum.MANUAL,
                              message: 'Please enter Path MTU size'
                            },
                            {
                              type: 'number',
                              min: 576,
                              max: 1450,
                              message: $t({
                                defaultMessage: 'Path MTU size must be between 576 and 1450'
                              })
                            }
                          ]}
                          children={<InputNumber
                            disabled={!!disabledFields?.includes('mtuSize')}/>}
                          validateFirst
                          noStyle
                        />
                        <div>{$t({ defaultMessage: 'bytes' })}</div>
                      </Space>
                            }
                          </Space>
                        </Radio>
                      </Space>
                    </Radio.Group>
                  }
                />
            }}
          </Form.Item>
        </Col>
        {
          (isEdgeVxLanTunnelKaReady && mtuType === MtuTypeEnum.AUTO) && !!!isL2greType &&
        <Col span={24}>
          <Form.Item
            label={$t({ defaultMessage: 'Path MTU Request Timeout' })}
            tooltip={$t(MessageMapping.mtu_request_timeout_tooltip)}
          >
            <Space>
              <Form.Item
                name='mtuRequestTimeout'
                rules={[
                  { required: true,
                    message: $t({ defaultMessage: 'Please enter Path MTU Request Timeout' })
                  },
                  { validator: (_, value) =>
                    validateMtuRequestTimeValue(value, mtuRequestTimeoutUnit)
                  }
                ]}
                children={<InputNumber disabled={isDefaultTunnelProfile ||
                  !!disabledFields?.includes('mtuRequestTimeout')}/>}
                validateFirst
                noStyle
                hasFeedback
              />
              <Form.Item
                name='mtuRequestTimeoutUnit'
                children={
                  <Select
                    options={mtuRequestTimeoutUnitOptions}
                    disabled={isDefaultTunnelProfile ||
                      !!disabledFields?.includes('mtuRequestTimeoutUnit')}
                    onChange={handelMtuRequestTimeUnitChange}
                  />
                }
                noStyle
              />
            </Space>
          </Form.Item>
        </Col>
        }
        {(isEdgeVxLanTunnelKaReady && mtuType === MtuTypeEnum.AUTO) && !!!isL2greType &&
        <Col span={24}>
          <Form.Item
            label={$t({ defaultMessage: 'Path MTU Request Retries' })}
            tooltip={$t(MessageMapping.mtu_request_retry_tooltip)}
          >
            <Space>
              <Form.Item
                name='mtuRequestRetry'
                rules={[
                  {
                    required: true,
                    message: $t({ defaultMessage: 'Please enter Path MTU Request Retries' })
                  },
                  {
                    type: 'number',
                    min: 3,
                    max: 64,
                    message: $t({
                      defaultMessage: 'Path MTU Request Retries must be between 3 and 64'
                    })
                  }
                ]}
                children={<InputNumber
                  disabled={isDefaultTunnelProfile ||
                    !!disabledFields?.includes('mtuRequestRetry')}/>}
                validateFirst
                noStyle
                hasFeedback
              />
              <div>{$t({ defaultMessage: 'retries' })}</div>
            </Space>
          </Form.Item>
        </Col>
        }
        <Col span={14}>
          <UI.StyledSpace align='center'>
            <UI.FormItemWrapper>
              <Form.Item
                label={$t({ defaultMessage: 'Force Fragmentation' })}
                tooltip={$t(MessageMapping.force_fragment_tooltip)}
              />
            </UI.FormItemWrapper>
            <Form.Item
              name='forceFragmentation'
              valuePropName='checked'
              children={<Switch
                // eslint-disable-next-line max-len
                disabled={isDefaultTunnelProfile || !!disabledFields?.includes('forceFragmentation')}/>}
            />
          </UI.StyledSpace>
        </Col>
        {!!!isL2greType &&
          <Col span={24}>
            <Form.Item
              label={$t({ defaultMessage: 'Tunnel Idle Timeout' })}
              tooltip={$t(MessageMapping.idle_timeout_tooltip)}
            >
              <Space>
                <Form.Item
                  name='ageTimeMinutes'
                  rules={[
                    { required: true,
                      message: $t({ defaultMessage: 'Please enter Tunnel Idle Timeout' })
                    },
                    { validator: (_, value) => validateAgeTimeValue(value, ageTimeUnit) }
                  ]}
                  children={<InputNumber
                    // eslint-disable-next-line max-len
                    disabled={isDefaultTunnelProfile || !!disabledFields?.includes('ageTimeMinutes')}/>}
                  validateFirst
                  noStyle
                  hasFeedback
                />
                <Form.Item
                  name='ageTimeUnit'
                  children={
                    <Select
                      options={ageTimeOptions}
                      disabled={isDefaultTunnelProfile || !!disabledFields?.includes('ageTimeUnit')}
                      onChange={handelAgeTimeUnitChange}
                    />
                  }
                  noStyle
                />
              </Space>
            </Form.Item>
          </Col>
        }
        {
          isEdgeVxLanTunnelKaReady && !!!isL2greType &&
        <Col span={24}>
          <Form.Item
            label={$t({ defaultMessage: 'Tunnel Keep Alive Interval' })}
            tooltip={$t(MessageMapping.keep_alive_interval_tooltip)}
          >
            <Space>
              <Form.Item
                name='keepAliveInterval'
                rules={[
                  {
                    required: true,
                    message: $t({ defaultMessage: 'Please enter Tunnel Keep Alive Interval' })
                  },
                  {
                    type: 'number',
                    min: 1,
                    max: 5,
                    message: $t({
                      defaultMessage: 'Tunnel Keep Alive Interval must be between 1 and 5'
                    })
                  }
                ]}
                children={<InputNumber disabled={isDefaultTunnelProfile ||
                  !!disabledFields?.includes('keepAliveInterval')}/>}
                validateFirst
                noStyle
                hasFeedback
              />
              <div>{$t({ defaultMessage: 'seconds' })}</div>
            </Space>
          </Form.Item>
        </Col>
        }
        {
          isEdgeVxLanTunnelKaReady && !!!isL2greType &&
        <Col span={24}>
          <Form.Item
            label={$t({ defaultMessage: 'Tunnel Keep Alive Retries' })}
            tooltip={$t(MessageMapping.keep_alive_retry_tooltip)}
          >
            <Space>
              <Form.Item
                name='keepAliveRetry'
                rules={[
                  {
                    required: true,
                    message: $t({ defaultMessage: 'Please enter Tunnel Keep Alive Retries' })
                  },
                  {
                    type: 'number',
                    min: 3,
                    max: 10,
                    message: $t({
                      defaultMessage: 'Tunnel Keep Alive Retries must be between 3 and 10'
                    })
                  }
                ]}
                children={<InputNumber disabled={isDefaultTunnelProfile ||
                  !!disabledFields?.includes('keepAliveRetry')}/>}
                validateFirst
                noStyle
                hasFeedback
              />
              <div>{$t({ defaultMessage: 'retries' })}</div>
            </Space>
          </Form.Item>
        </Col>
        }
      </Row>}
      {<EdgeCompatibilityDrawer
        visible={!!edgeCompatibilityFeature}
        type={EdgeCompatibilityType.ALONE}
        title={$t({ defaultMessage: 'Compatibility Requirement' })}
        featureName={edgeCompatibilityFeature}
        onClose={() => setEdgeCompatibilityFeature(undefined)}
      />}
    </>
  )
}
