/* eslint-disable max-len */
import { useEffect, useState, useRef, useMemo } from 'react'

import {
  SelectProps,
  Checkbox,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Space,
  Spin,
  Select,
  Tooltip,
  Typography
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Modal
} from '@acx-ui/components'
import { Features, useSplitTreatment } from '@acx-ui/feature-toggle'
import {
  useGetNetworkApGroupsQuery
} from '@acx-ui/rc/services'
import {
  RadioEnum,
  RadioTypeEnum,
  VLAN_PREFIX,
  NetworkApGroup,
  VlanPool,
  VlanType,
  WlanSecurityEnum,
  ApGroupModalWidgetProps
} from '@acx-ui/rc/utils'

import * as UI       from './styledComponents'
import { VlanInput } from './VlanInput'

export const getVlanString = (vlanPool?: VlanPool | null, vlanId?: number) => {
  let vlanPrefix = ''
  let vlanString
  let vlanType

  if (vlanPool) {
    vlanString = vlanPool.name
    vlanPrefix = VLAN_PREFIX.POOL
    vlanType = VlanType.Pool
  } else  {
    vlanString = vlanId
    vlanPrefix = VLAN_PREFIX.VLAN
    vlanType = VlanType.VLAN
  }

  return { vlanPrefix, vlanString, vlanType }
}

const isDisableAllAPs = (apGroups?: NetworkApGroup[]) => {
  if (!apGroups) {
    return false
  }
  return !apGroups.every(apGroup => !apGroup.validationError)
}

const radioTypeEnumToString = (radioType: RadioTypeEnum) => {
  return radioType.replace(/-/g, ' ') //FIXME: useIntl
}

export interface VlanDate {
  vlanId?: number,
  vlanPool?: VlanPool | null,
  vlanType: VlanType
}

interface NetworkApGroupWithSelected extends NetworkApGroup {
  selected: boolean
}

const defaultAG: NetworkApGroupWithSelected = {
  selected: true,
  apGroupId: '',
  apGroupName: '',
  isDefault: true,
  radio: RadioEnum.Both,
  radioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
  vlanId: 1
}

export function NetworkApGroupDialog (props: ApGroupModalWidgetProps) {
  const { $t } = useIntl()
  const triBandRadioFeatureFlag = useSplitTreatment(Features.TRI_RADIO)

  const { networkVenue, venueName, wlan, formName, tenantId } = props

  const [form] = Form.useForm()

  const open = !!props.visible

  // reset form fields when modal is closed
  const prevOpenRef = useRef(false)
  useEffect(() => {
    prevOpenRef.current = open
  }, [open])

  const prevOpen = prevOpenRef.current
  useEffect(() => {
    if (!open && prevOpen) {
      setLoading(false)
      form.resetFields()
    }
  }, [form, prevOpen, open])

  const defaultVlanString = getVlanString(wlan?.advancedCustomization?.vlanPool, wlan?.vlanId)

  const networkApGroupsQuery = useGetNetworkApGroupsQuery({ params: { tenantId },
    payload: [{
      networkId: networkVenue?.networkId,
      ssids: [wlan?.ssid],
      venueId: networkVenue?.venueId
    }]
  })

  const formInitData = useMemo(() => {
    // if specific AP groups were selected or the  All APs option is disabled,
    // then the "select specific AP group" option should be selected
    const isAllAps = networkVenue?.isAllApGroups !== false && !isDisableAllAPs(networkVenue?.apGroups)
    let apGroups: NetworkApGroupWithSelected[] = (networkVenue?.apGroups || []).map(ag => ({ ...ag, selected: true }))
    apGroups = _.isEmpty(apGroups) ? [defaultAG] : apGroups

    return {
      selectionType: isAllAps ? 0 : 1,
      allApGroupsRadioTypes: networkVenue?.allApGroupsRadioTypes || [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz],
      apgroups: apGroups,
      apTags: []
    }
  }, [networkVenue, networkApGroupsQuery.data])

  useEffect(() => {
    form.setFieldsValue(formInitData)
  }, [form, formInitData])

  const [loading, setLoading] = useState(false)


  const RadioSelect = (props: SelectProps) => {
    const isWPA3 = wlan?.wlanSecurity === WlanSecurityEnum.WPA3
    const disabledBandTooltip = $t({ defaultMessage: '6GHz disabled for non-WPA3 networks. To enable 6GHz operation, configure a WLAN for WPA3 operation.' })
    if (!triBandRadioFeatureFlag || !isWPA3) {
      _.remove(props.value, (v) => v === RadioTypeEnum._6_GHz)
    }
    return (
      <Select
        {...props}
        mode='multiple'
        style={{ width: '220px' }}
      >
        <Select.Option value={RadioTypeEnum._2_4_GHz} title=''>{radioTypeEnumToString(RadioTypeEnum._2_4_GHz)}</Select.Option>
        <Select.Option value={RadioTypeEnum._5_GHz} title=''>{radioTypeEnumToString(RadioTypeEnum._5_GHz)}</Select.Option>
        { triBandRadioFeatureFlag && (
          <Select.Option
            value={RadioTypeEnum._6_GHz}
            disabled={!isWPA3}
            title={!isWPA3 ? disabledBandTooltip : ''}
          >{radioTypeEnumToString(RadioTypeEnum._6_GHz)}</Select.Option>
        )}
      </Select>
    )
  }

  const ApGroupItem = ({ apgroup, name }: { apgroup: NetworkApGroup, name: number }) => {
    const apGroupName = apgroup?.isDefault ? $t({ defaultMessage: 'APs not assigned to any group' }) : apgroup?.apGroupName

    const apGroupVlanId = apgroup?.vlanId || wlan?.vlanId
    const apGroupVlanPool = apgroup?.vlanPoolId ? {
      name: apgroup.vlanPoolName || '',
      id: apgroup.vlanPoolId || '',
      vlanMembers: []
    } : wlan?.advancedCustomization?.vlanPool
    const apGroupVlanType = apGroupVlanPool ? VlanType.Pool : VlanType.VLAN

    const handleVlanInputChange = (value: VlanDate) => {
      // console.log('handleVlanInputChange', value)

      form.setFields([
        { name: ['apgroups', name, 'vlanId'], value: value.vlanId },
        { name: ['apgroups', name, 'vlanPoolId'], value: value.vlanPool?.id },
        { name: ['apgroups', name, 'vlanPoolName'], value: value.vlanPool?.name },
        { name: ['apgroups', name, 'vlanType'], value: value.vlanType }
      ])
    }

    const selected = Form.useWatch(['apgroups', name, 'selected'], form)

    let errorTooltip = ''
    if (apgroup.validationError) {
      if (apgroup.validationErrorReachedMaxConnectedNetworksLimit) {
        errorTooltip = $t({ defaultMessage: 'You cannot activate this network on this AP Group because it already has 15 active networks' })
      } else {
        errorTooltip = $t({ defaultMessage: 'You cannot activate this network to this AP Group. A network with the same SSID is already active' })
      }
    }

    return (
      <>
        <Col span={8}>
          <Form.Item name={[name, 'apGroupId']} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'vlanType']} initialValue={apGroupVlanType} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'vlanId']} initialValue={apGroupVlanId} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'vlanPoolId']} initialValue={apGroupVlanPool?.id} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'vlanPoolName']} initialValue={apGroupVlanPool?.name} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Tooltip title={errorTooltip}>
            <UI.FormItemRounded name={[name, 'selected']} valuePropName='checked'>
              <Checkbox disabled={apgroup.validationError} >{apGroupName}</Checkbox>
            </UI.FormItemRounded>
          </Tooltip>
        </Col>
        <Col span={8}>
          <UI.FormItemRounded>
            { selected && (<VlanInput apgroup={apgroup} wlan={wlan} onChange={handleVlanInputChange}/>) }
          </UI.FormItemRounded>
        </Col>
        <Col span={8}>
          <UI.FormItemRounded name={[name, 'radioTypes']}>
            { selected && (
              <RadioSelect />
            )}
          </UI.FormItemRounded>
        </Col>
      </>
    )
  }

  const onOk = () => {
    setLoading(true)
    form.submit()
  }

  return (
    <Modal
      {...props}
      title={$t({ defaultMessage: 'Select APs' })}
      subTitle={$t({ defaultMessage: 'Define how this network will be activated on venue "{venueName}"' }, { venueName: venueName })}
      okText={$t({ defaultMessage: 'Apply' })}
      maskClosable={false}
      keyboard={false}
      closable={false}
      width={840}
      onOk={onOk}
      okButtonProps={{ disabled: loading }}
      cancelButtonProps={{ disabled: loading }}
    >
      <Spin spinning={loading}><Form
        form={form}
        layout='horizontal'
        size='small'
        name={formName}
        // initialValues={formInitData}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
      >
        <Form.Item name='selectionType'>
          <Radio.Group>
            <Space direction='vertical' size='middle'>
              <Radio value={0} disabled={isDisableAllAPs(networkVenue?.apGroups)}>{$t({ defaultMessage: 'All APs' })}
                <UI.RadioDescription>{$t({ defaultMessage: 'Including any AP that will be added to this venue in the future.' })}</UI.RadioDescription>
              </Radio>
              <Form.Item noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.selectionType !== currentValues.selectionType}>
                { ({ getFieldValue }) => getFieldValue('selectionType') === 0 && (
                  <UI.FormItemRounded>
                    <Form.Item label={$t({ defaultMessage: 'VLAN' })} labelCol={{ span: 5 }}>
                      {`${defaultVlanString.vlanPrefix}${defaultVlanString.vlanString}`} {$t({ defaultMessage: '(Default)' })}
                    </Form.Item>
                    <Form.Item name='allApGroupsRadioTypes'
                      label={$t({ defaultMessage: 'Radio Band' })}
                      labelCol={{ span: 5 }}>
                      <RadioSelect />
                    </Form.Item>
                  </UI.FormItemRounded>
                )}
              </Form.Item>

              <Radio value={1}>{$t({ defaultMessage: 'Select specific AP groups' })}
                <UI.RadioDescription>{$t({ defaultMessage: 'Including any AP that will be added to a selected AP group in the future.' })}</UI.RadioDescription>
              </Radio>
              <Form.List name='apgroups'>
                { (fields) => (
                  <Form.Item noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.selectionType !== currentValues.selectionType}>
                    { ({ getFieldValue }) => getFieldValue('selectionType') === 1 && (
                      <Row gutter={[4, 0]} style={{ width: '750px' }}>
                        <Col span={8}></Col>
                        <Col span={8}>
                          <Typography.Title level={5}>{$t({ defaultMessage: 'VLAN' })}</Typography.Title>
                        </Col>
                        <Col span={8}>
                          <Typography.Title level={5}>{$t({ defaultMessage: 'Radio Band' })}</Typography.Title>
                        </Col>
                        { fields.map((field, index) => (
                          <Form.Item key={field.key} noStyle>
                            <ApGroupItem name={field.name} apgroup={formInitData.apgroups[index]} />
                          </Form.Item>
                        ))}
                      </Row>
                    )}
                  </Form.Item>
                )}
              </Form.List>

              <Radio value={2}>{$t({ defaultMessage: 'Select APs by tag' })}
                <UI.RadioDescription>{$t({ defaultMessage: 'This network will be only applied to APs with the tags.' })}</UI.RadioDescription>
              </Radio>
              <Form.Item noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.selectionType !== currentValues.selectionType}>
                { ({ getFieldValue }) => getFieldValue('selectionType') === 2 && (
                  <Form.Item label={$t({ defaultMessage: 'Tags' })} name='apTags'>
                    <Select
                      mode='tags'
                      size='middle'
                      allowClear
                      style={{ width: '400px' }}
                    >
                    </Select>
                  </Form.Item>
                )}
              </Form.Item>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form></Spin>
    </Modal>
  )
}

export default NetworkApGroupDialog
