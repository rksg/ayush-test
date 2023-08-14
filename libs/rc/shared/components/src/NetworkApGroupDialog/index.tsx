/* eslint-disable max-len */
import { useEffect, useState, useRef, useMemo } from 'react'

import {
  SelectProps,
  ModalProps as AntdModalProps,
  Checkbox,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Space,
  Spin,
  Select
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Modal,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetNetworkApGroupsQuery
} from '@acx-ui/rc/services'
import {
  RadioEnum,
  RadioTypeEnum,
  NetworkApGroup,
  VlanPool,
  VlanType,
  WlanSecurityEnum,
  getVlanString,
  NetworkVenue,
  NetworkSaveData
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import * as UI       from './styledComponents'
import { VlanInput } from './VlanInput'

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

export interface ApGroupModalWidgetProps extends AntdModalProps {
  formName?: string
  networkVenue?: NetworkVenue
  venueName?: string
  wlan?: NetworkSaveData['wlan']
  tenantId?: string
}

export function NetworkApGroupDialog (props: ApGroupModalWidgetProps) {
  const { $t } = useIntl()
  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)

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
  }, { skip: !networkVenue || !wlan })

  const formInitData = useMemo(() => {
    // if specific AP groups were selected or the  All APs option is disabled,
    // then the "select specific AP group" option should be selected
    const isAllAps = networkVenue?.isAllApGroups !== false && !isDisableAllAPs(networkVenue?.apGroups)

    let allApGroups: NetworkApGroupWithSelected[] = (networkApGroupsQuery.data || [])
      .map(nv => nv.apGroups || []).flat()
      .map(allAg => {
        const apGroup = _.find(networkVenue?.apGroups, ['apGroupId', allAg.apGroupId])
        return { ...allAg, ...apGroup, selected: !!apGroup }
      })
    allApGroups = _.isEmpty(allApGroups) ? [defaultAG] : allApGroups

    return {
      selectionType: isAllAps ? 0 : 1,
      allApGroupsRadioTypes: networkVenue?.allApGroupsRadioTypes || [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz],
      apgroups: allApGroups,
      apTags: []
    }
  }, [networkVenue, networkApGroupsQuery.data])

  useEffect(() => {
    form.setFieldsValue(formInitData)
  }, [form, formInitData])

  const [loading, setLoading] = useState(false)


  const RadioSelect = (props: SelectProps) => {
    const isWPA3 = wlan?.wlanSecurity && [WlanSecurityEnum.WPA3, WlanSecurityEnum.OWE, WlanSecurityEnum.OWETransition].includes(wlan?.wlanSecurity)
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
      const isPoolType = value.vlanType === VlanType.Pool
      form.setFields([
        { name: ['apgroups', name, 'vlanId'], value: !isPoolType ? value.vlanId : '' },
        { name: ['apgroups', name, 'vlanPoolId'], value: isPoolType ? value.vlanPool?.id||'' : '' },
        { name: ['apgroups', name, 'vlanPoolName'], value: isPoolType ? value.vlanPool?.name||'' : '' },
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
        <Tooltip title={errorTooltip}><Col span={8}>
          <Form.Item name={[name, 'apGroupId']} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'vlanType']} initialValue={apGroupVlanType} noStyle>
            <Input type='hidden' />
          </Form.Item>
          { apgroup.vlanId &&
            <Form.Item name={[name, 'vlanId']} initialValue={apGroupVlanId} noStyle>
              <Input type='hidden' />
            </Form.Item>
          }
          { !apgroup.vlanId && <>
            <Form.Item name={[name, 'vlanPoolId']} initialValue={apGroupVlanPool?.id} noStyle>
              <Input type='hidden' />
            </Form.Item>
            <Form.Item name={[name, 'vlanPoolName']} initialValue={apGroupVlanPool?.name} noStyle>
              <Input type='hidden' />
            </Form.Item>
          </>}

          <UI.FormItemRounded name={[name, 'selected']} valuePropName='checked'>
            <Checkbox disabled={apgroup.validationError}
              onChange={() => { form.validateFields() }}>{apGroupName}</Checkbox>
          </UI.FormItemRounded>
        </Col></Tooltip>
        <Col span={8}>
          <UI.FormItemRounded>
            { selected &&
            (<VlanInput apgroup={apgroup} wlan={wlan} onChange={handleVlanInputChange}/>) }
          </UI.FormItemRounded>
        </Col>
        <Col span={8}>
          <UI.FormItemRounded
            name={[name, 'radioTypes']}
            rules={[
              {
                validator: (obj, value) => {
                  const { $t } = getIntl()
                  if (form.getFieldsValue().apgroups[name].selected && _.isEmpty(value)) {
                    return Promise.reject($t({ defaultMessage: 'Please enter Radio Band' }))
                  }
                  return Promise.resolve()
                }
              }
            ]}>
            { selected ? <RadioSelect /> : <Input type='hidden' /> }
          </UI.FormItemRounded>
        </Col>
      </>
    )
  }

  const onOk = () => {
    form.validateFields()
      .then(() => {
        setLoading(true)
        form.submit()
      })
      .catch(() => {
        return
      })
  }

  return (
    <Modal
      {...props}
      title={$t({ defaultMessage: 'Select APs' })}
      subTitle={$t({ defaultMessage: 'Define how this network will be activated on venue "{venueName}"' }, { venueName: venueName })}
      okText={$t({ defaultMessage: 'Apply' })}
      maskClosable={true}
      keyboard={false}
      closable={true}
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
        onFinish={props.onOk}
      >
        <Form.Item name='selectionType'
          rules={[
            {
              validator: (obj, value) => {
                const { $t } = getIntl()
                if (value === 1 &&
                  form.getFieldsValue().apgroups.filter((i: { selected: boolean }) => i.selected).length === 0) {
                  return Promise.reject($t({ defaultMessage: 'Please select AP Group' }))
                }
                return Promise.resolve()
              }
            }
          ]}>
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
                      {defaultVlanString.vlanText}
                    </Form.Item>
                    <Form.Item name='allApGroupsRadioTypes'
                      label={$t({ defaultMessage: 'Radio Band' })}
                      rules={[{ required: true }]}
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
                          <UI.VerticalLabel>{$t({ defaultMessage: 'VLAN' })}</UI.VerticalLabel>
                        </Col>
                        <Col span={8}>
                          <UI.VerticalLabel>{$t({ defaultMessage: 'Radio Band' })}</UI.VerticalLabel>
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

              {/* <Radio value={2}>{$t({ defaultMessage: 'Select APs by tag' })} // TODO: Waiting for TAG feature support
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
              </Form.Item> */}
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form></Spin>
    </Modal>
  )
}

export default NetworkApGroupDialog
