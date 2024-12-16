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
  Spin
} from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import _            from 'lodash'
import { useIntl }  from 'react-intl'

import {
  Modal,
  Select,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import {
  useGetEnhancedVlanPoolPolicyTemplateListQuery,
  useGetNetworkApGroupsV2Query, useGetRbacNetworkApGroupsQuery,
  useGetVLANPoolPolicyViewModelListQuery
} from '@acx-ui/rc/services'
import {
  RadioEnum,
  RadioTypeEnum,
  NetworkApGroup,
  VlanPool,
  VlanType,
  getVlanString,
  NetworkVenue,
  NetworkSaveData,
  IsNetworkSupport6g,
  WlanSecurityEnum, NetworkTypeEnum,
  useConfigTemplate, useConfigTemplateQueryFnSwitcher, TableResult, VLANPoolViewModelType
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
  network?: NetworkSaveData | null
  tenantId?: string
}

type RadioSelectProps = SelectProps & {
  isSupport6G: boolean
}

const RadioSelect = (props: RadioSelectProps) => {
  const { $t } = useIntl()
  const { isSupport6G, ...otherProps } = props
  const disabledBandTooltip = $t({ defaultMessage: '6GHz disabled for non-WPA3 networks. To enable 6GHz operation, configure a WLAN for WPA3 operation.' })
  if (!isSupport6G) {
    _.remove(otherProps.value, (v) => v === RadioTypeEnum._6_GHz)
  }
  return (
    <Select
      {...otherProps}
      mode='multiple'
      showArrow
      style={{ width: '220px' }}
    >
      <Select.Option value={RadioTypeEnum._2_4_GHz} title=''>{radioTypeEnumToString(RadioTypeEnum._2_4_GHz)}</Select.Option>
      <Select.Option value={RadioTypeEnum._5_GHz} title=''>{radioTypeEnumToString(RadioTypeEnum._5_GHz)}</Select.Option>
      <Select.Option
        value={RadioTypeEnum._6_GHz}
        disabled={!isSupport6G}
        title={!isSupport6G ? disabledBandTooltip : ''}
      >
        {radioTypeEnumToString(RadioTypeEnum._6_GHz)}
      </Select.Option>
    </Select>
  )
}

export function NetworkApGroupDialog (props: ApGroupModalWidgetProps) {
  const { $t } = useIntl()

  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isSupport6gOWETransition = useIsSplitOn(Features.WIFI_OWE_TRANSITION_FOR_6G)
  const { isTemplate } = useConfigTemplate()

  const { networkVenue, venueName, network, formName, tenantId } = props
  const { wlan, type } = network || {}
  const isSupport6G = IsNetworkSupport6g(network, { isSupport6gOWETransition })

  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const [vlanPoolSelectOptions, setVlanPoolSelectOptions] = useState<VlanPool[]>()

  const [form] = Form.useForm()

  const selectionType = useWatch('selectionType', form)

  const open = !!props.visible

  // reset form fields when modal is closed
  const prevOpenRef = useRef(false)
  const prevOpen = prevOpenRef.current

  useEffect(() => {
    prevOpenRef.current = open
    if (!open && prevOpen) {
      setLoading(false)
      form.resetFields()
    }
  }, [form, prevOpen, open])

  const defaultVlanString = getVlanString(networkVenue?.vlanPoolId ? {
    id: networkVenue?.vlanPoolId,
    name: networkVenue?.vlanPoolName ?? '',
    vlanMembers: networkVenue?.vlanMembers ?? []
  } : null, wlan?.vlanId)

  const { data: networkApGroupsData, isLoading: isNetworkLoading } = useNetworkApGroupsInstance()

  function useNetworkApGroupsInstance () {
    const networkApGroupsV2Query = useGetNetworkApGroupsV2Query({ params: { tenantId },
      payload: [{
        networkId: networkVenue?.networkId,
        venueId: networkVenue?.venueId,
        isTemplate: isTemplate
      }]
    }, { skip: isWifiRbacEnabled || !networkVenue || !wlan })

    const networkApGroupsRbacQuery = useGetRbacNetworkApGroupsQuery({ params: { tenantId },
      payload: [{
        networkId: networkVenue?.networkId,
        venueId: networkVenue?.venueId,
        isTemplate: isTemplate
      }]
    }, { skip: !isWifiRbacEnabled || !networkVenue || !wlan })

    return isWifiRbacEnabled ? networkApGroupsRbacQuery : networkApGroupsV2Query
  }

  const formInitData = useMemo(() => {
    // if specific AP groups were selected or the  All APs option is disabled,
    // then the "select specific AP group" option should be selected
    const isAllAps = networkVenue?.isAllApGroups !== false && !isDisableAllAPs(networkVenue?.apGroups)

    let allApGroups: NetworkApGroupWithSelected[] = (networkApGroupsData || [])
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
  }, [networkVenue, networkApGroupsData])

  const [loading, setLoading] = useState(false)

  const { data: instanceListResult } = useConfigTemplateQueryFnSwitcher<TableResult<VLANPoolViewModelType>>({
    useQueryFn: useGetVLANPoolPolicyViewModelListQuery,
    useTemplateQueryFn: useGetEnhancedVlanPoolPolicyTemplateListQuery,
    skip: false,
    payload: {
      fields: ['name', 'id', 'vlanMembers'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    },
    enableRbac: isPolicyRbacEnabled
  })

  useEffect(() => {
    form.setFieldsValue(formInitData)
    if (instanceListResult) {
      setVlanPoolSelectOptions(instanceListResult.data.map(m => {
        return { name: m.name, id: m.id } as VlanPool
      }) as VlanPool[])
    }
  },[formInitData, instanceListResult])


  const ApGroupItem = ({ apgroup, name }: { apgroup: NetworkApGroup, name: number }) => {
    const apGroupName = apgroup?.isDefault ? $t({ defaultMessage: 'APs not assigned to any group' }) : apgroup?.apGroupName

    const apGroupVlanId = apgroup?.vlanId || wlan?.vlanId
    const apGroupVlanPool = apgroup?.vlanPoolId ? {
      name: vlanPoolSelectOptions?.find((vlanPool) => vlanPool.id === apgroup?.vlanPoolId)?.name || '',
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
    if (apgroup?.validationError) {
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
            <VlanInput
              key={name}
              apgroup={apgroup}
              wlan={wlan}
              vlanPoolSelectOptions={vlanPoolSelectOptions}
              onChange={handleVlanInputChange}
              selected={selected}
            />
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
              },
              {
                validator: (obj, value) => {
                  if (form.getFieldsValue().apgroups[name].selected)
                    return validateRadioBandForDsaeNetwork(value)

                  return Promise.resolve()
                }
              }
            ]}>
            { selected ? <RadioSelect isSupport6G={isSupport6G}/> : <Input type='hidden' /> }
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

  function validateRadioBandForDsaeNetwork (radios: string[]) {
    if (wlan?.wlanSecurity
         && type === NetworkTypeEnum.DPSK
         && wlan?.wlanSecurity === WlanSecurityEnum.WPA23Mixed
         && radios.length
         && radios.length === 1
         && radios.includes(RadioTypeEnum._6_GHz)) {
      return Promise.reject($t({ defaultMessage:
        'Configure a <VenueSingular></VenueSingular> using only 6 GHz, in WPA2/WPA3 Mixed Mode DPSK Network, requires a combination of other Radio Bands. To use 6 GHz, other radios must be added.' }))
    }
    return Promise.resolve()
  }

  return (
    <Modal
      {...props}
      title={$t({ defaultMessage: 'Select APs' })}
      subTitle={$t({ defaultMessage: 'Define how this network will be activated on <venueSingular></venueSingular> "{venueName}"' }, { venueName: venueName })}
      okText={$t({ defaultMessage: 'Apply' })}
      maskClosable={true}
      keyboard={false}
      closable={true}
      width={840}
      onOk={onOk}
      okButtonProps={{ disabled: loading || isNetworkLoading }}
      cancelButtonProps={{ disabled: loading || isNetworkLoading }}
    >
      <Spin spinning={loading || isNetworkLoading}><Form
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
                <UI.RadioDescription>{$t({ defaultMessage: 'Including any AP that will be added to this <venueSingular></venueSingular> in the future.' })}</UI.RadioDescription>
              </Radio>
              <Form.Item noStyle>
                { selectionType === 0 && <UI.FormItemRounded>
                  <Form.Item label={$t({ defaultMessage: 'VLAN' })} labelCol={{ span: 5 }}>
                    {defaultVlanString.vlanText}
                  </Form.Item>
                  <Form.Item name='allApGroupsRadioTypes'
                    label={$t({ defaultMessage: 'Radio Band' })}
                    rules={[{ required: true },
                      {
                        validator: (_, value) => validateRadioBandForDsaeNetwork(value)
                      }]}
                    labelCol={{ span: 5 }}>
                    <RadioSelect isSupport6G={isSupport6G}/>
                  </Form.Item>
                </UI.FormItemRounded>}
              </Form.Item>

              <Radio value={1}>{$t({ defaultMessage: 'Select specific AP groups' })}
                <UI.RadioDescription>{$t({ defaultMessage: 'Including any AP that will be added to a selected AP group in the future.' })}</UI.RadioDescription>
              </Radio>
              <Form.List name='apgroups'>
                { (fields) => (
                  <Form.Item noStyle>
                    { selectionType === 1 && <Row gutter={[4, 0]} style={{ width: '750px' }}>
                      <Col span={8}></Col>
                      <Col span={8}>
                        <UI.VerticalLabel>{$t({ defaultMessage: 'VLAN' })}</UI.VerticalLabel>
                      </Col>
                      <Col span={8}>
                        <UI.VerticalLabel>{$t({ defaultMessage: 'Radio Band' })}</UI.VerticalLabel>
                      </Col>
                      { fields.map((field, index) => (
                        <Form.Item key={field.key} noStyle>
                          <ApGroupItem key={field.key} name={field.name} apgroup={form.getFieldValue('apgroups')[index]} />
                        </Form.Item>
                      ))}
                    </Row>}
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
