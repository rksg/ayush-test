/* eslint-disable max-len */
import React, { useEffect, useState, useRef, useMemo } from 'react'

import { EditOutlined, ReloadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import {
  ModalProps as AntdModalProps,
  SelectProps,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
  RadioChangeEvent,
  Row,
  Space,
  Spin,
  Select,
  Typography
} from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  Button,
  Modal
} from '@acx-ui/components'
import { useSplitTreatment } from '@acx-ui/feature-toggle'
import {
  RadioEnum,
  RadioTypeEnum,
  VLAN_PREFIX,
  NetworkVenue,
  NetworkApGroup,
  NetworkSaveData,
  VlanPool,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'

import { RadioDescription } from '../../NetworkForm/styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

enum VlanType { // Move to models
  VLAN = 'vlanId',
  Pool = 'vlanPool'
}

const getVlanString = (vlanPool?: VlanPool | null, vlanId?: number) => {
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

interface ApGroupModalProps extends AntdModalProps {
  networkVenue?: NetworkVenue
  venueName?: string
  network?: NetworkSaveData
  formName: string
}

interface VlanDate {
  vlanId?: number,
  vlanPool?: VlanPool | null,
  vlanType: VlanType
}

const defaultAG: NetworkApGroup = {
  apGroupId: '',
  apGroupName: '',
  isDefault: true,
  radio: RadioEnum.Both,
  radioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
  vlanId: 1
}

export function NetworkApGroupDialog (props: ApGroupModalProps) {
  const { $t } = useIntl()
  const triBandRadioFeatureFlag = useSplitTreatment('tri-band-radio-toggle')

  const { networkVenue, venueName, network, formName } = props

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

  const defaultVlanString = getVlanString(network?.wlan?.advancedCustomization?.vlanPool, network?.wlan?.vlanId)

  const formInitData = useMemo(() => {
    // if specific AP groups were selected or the  All APs option is disabled,
    // then the "select specific AP group" option should be selected
    const isAllAps = networkVenue?.isAllApGroups !== false && !isDisableAllAPs(networkVenue?.apGroups)    
    return {
      selectionType: isAllAps ? 0 : 1,
      allApGroupsRadioTypes: networkVenue?.allApGroupsRadioTypes || [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz],
      apgroups: networkVenue?.apGroups || [defaultAG],
      apTags: []
    }
  }, [networkVenue])

  useEffect(() => {
    form.setFieldsValue(formInitData)
  }, [form, formInitData])

  const [loading, setLoading] = useState(false)

  const onTypeChange = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value)
    form.setFieldsValue({
      selectionType: e.target.value
    })
  }

  const handleTagChange = (value: string) => {
    console.log(`selected ${value}`)
  }


  const style: React.CSSProperties = { background: '#F8F8FA', padding: '8px', borderRadius: '4px' }



  const RadioSelect = (props: SelectProps) => {
    const isWPA3 = network?.wlan?.wlanSecurity === WlanSecurityEnum.WPA3
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

  const VlanInput = ({ apgroup, onChange }: { apgroup: NetworkApGroup, onChange: (data: VlanDate) => void }) => {
    const [isEditMode, setEditMode] = useState(false)
    const [isDirty, setDirty] = useState(true)

    const apGroupVlanId = apgroup?.vlanId || network?.wlan?.vlanId
    const apGroupVlanPool = apgroup?.vlanPoolId ? {
      name: apgroup.vlanPoolName || '',
      id: apgroup.vlanPoolId || '',
      vlanMembers: []
    } : network?.wlan?.advancedCustomization?.vlanPool

    const apGroupVlanType = apGroupVlanPool ? VlanType.Pool : VlanType.VLAN
    const [selectedVlan, setSelectedVlan] = useState<VlanDate>({ vlanId: apGroupVlanId, vlanPool: apGroupVlanPool, vlanType: apGroupVlanType })

    const vlanLabel = useRef('')

    useEffect(() => {
      onChange(selectedVlan)
      const { vlanPrefix, vlanString, vlanType } = getVlanString(selectedVlan.vlanPool, selectedVlan.vlanId)
      const valueSuffix = _.isEqual({ vlanPrefix, vlanString, vlanType }, defaultVlanString) ? $t({ defaultMessage: '(Default)' }) : $t({ defaultMessage: '(Custom)' })
      vlanLabel.current = `${vlanPrefix}${vlanString} ${valueSuffix}`
    }, [selectedVlan])


    const handleVlanTypeChange = (value: VlanType) => {
      setSelectedVlan({
        vlanId: selectedVlan.vlanId,
        vlanPool: selectedVlan.vlanPool,
        vlanType: value
      })
    }
    const handleVlanIdChange = (value: number) => {
      setSelectedVlan({
        vlanId: value,
        vlanPool: selectedVlan.vlanPool,
        vlanType: selectedVlan.vlanType
      })
    }
    const handleVlanPoolChange = (value: { value: string; label: string }) => {
      setSelectedVlan({
        vlanId: selectedVlan.vlanId,
        vlanPool: {
          name: value.label,
          id: value.value,
          vlanMembers: []
        },
        vlanType: selectedVlan.vlanType
      })
    }
    const reset = () => {
      setSelectedVlan({
        vlanId: apGroupVlanId,
        vlanPool: apGroupVlanPool,
        vlanType: apGroupVlanType
      })
    }

    const fakePool: VlanPool[] = [
      {
        name: 'Pool 1', id: 'a', vlanMembers: []
      }, {
        name: 'Pool 2', id: 'b', vlanMembers: []
      }
    ]

    return (
      <Space size='small'>
        { isEditMode ? (
          <>
            <Select onChange={handleVlanTypeChange} defaultValue={selectedVlan.vlanType}>
              <Select.Option value={VlanType.Pool}>{$t({ defaultMessage: 'Pool' })}</Select.Option>
              <Select.Option value={VlanType.VLAN}>{$t({ defaultMessage: 'VLAN' })}</Select.Option>
            </Select>
            { selectedVlan.vlanType === VlanType.VLAN ? (
              <InputNumber max={4094} min={1} controls={false} onChange={handleVlanIdChange} defaultValue={selectedVlan.vlanId}/>
            ) : (
              // TODO:  vlanPoolingService.fetchAllVlanPools  WifiUrlsInfo.GetVlanPoolByQuery.url
              <Select labelInValue onChange={handleVlanPoolChange}>
                <Select.Option value={fakePool[0].id}>{fakePool[0].name}</Select.Option>
                <Select.Option value={fakePool[1].id}>{fakePool[1].name}</Select.Option>
              </Select>
            )}
            <Button type='link' icon={<CheckOutlined />} onClick={()=>{setEditMode(false)}}></Button>
            <Button type='link' icon={<CloseOutlined />} onClick={()=>{setEditMode(false)}}></Button>
          </>
        ) : (
          <>
            <label>{vlanLabel.current}</label>
            <Button type='link' icon={<EditOutlined />} onClick={()=>{setEditMode(true)}}></Button>
            { isDirty && (<Button type='link' icon={<ReloadOutlined />} onClick={()=>{reset()}}></Button>) }
          </>
        )}
      </Space>
    )
  }

  const ApGroupItem = ({ apgroup, name }: { apgroup: NetworkApGroup, name: number }) => {
    const apGroupName = apgroup?.isDefault ? $t({ defaultMessage: 'APs not assigned to any group' }) : apgroup?.apGroupName

    const apGroupVlanId = apgroup?.vlanId || network?.wlan?.vlanId
    const apGroupVlanPool = apgroup?.vlanPoolId ? {
      name: apgroup.vlanPoolName || '',
      id: apgroup.vlanPoolId || '',
      vlanMembers: []
    } : network?.wlan?.advancedCustomization?.vlanPool
    const apGroupVlanType = apGroupVlanPool ? VlanType.Pool : VlanType.VLAN

    const onApGroupChange = (e: CheckboxChangeEvent) => {
      console.log('checked = ', e.target.checked)
      form.setFields([
        { name: ['apgroups', name, 'selected'], value: !!e.target.checked }
      ])
    }

    const handleRadioChange = (value: string) => {
      console.log(`selected ${value}`)
    }
 
    const handleVlanInputChange = (value: VlanDate) => {
      console.log('handleVlanInputChange', value)

      form.setFields([
        { name: ['apgroups', name, 'vlanId'], value: value.vlanId },
        { name: ['apgroups', name, 'vlanPoolId'], value: value.vlanPool?.id },
        { name: ['apgroups', name, 'vlanPoolName'], value: value.vlanPool?.name },
        { name: ['apgroups', name, 'vlanType'], value: value.vlanType }
      ])
    }

    const selected = Form.useWatch(['apgroups', name, 'selected'], form)

    return (
      <>
        <Col span={8}>
          <Form.Item name={[name, 'apGroupId']} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'vlanType']} initialValue={apGroupVlanType} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'vlanId']} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'vlanPoolId']} initialValue={apGroupVlanPool?.id} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'vlanPoolName']} initialValue={apGroupVlanPool?.name} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'selected']} style={style} valuePropName='checked'>
            {/*TODO: error tooltip */}
            <Checkbox disabled={apgroup.validationError} onChange={onApGroupChange}>{apGroupName}</Checkbox>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item style={style}>
            { selected && (<VlanInput apgroup={apgroup} onChange={handleVlanInputChange}/>) }
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={[name, 'radioTypes']} style={style}>
            { selected && (
              <RadioSelect 
                onChange={handleRadioChange}
              />
            )}
          </Form.Item>
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
        initialValues={formInitData}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
      >
        <Form.Item name='selectionType'>
          <Radio.Group onChange={onTypeChange}>
            <Space direction='vertical' size='middle'>
              <Radio value={0} disabled={isDisableAllAPs(networkVenue?.apGroups)}>{$t({ defaultMessage: 'All APs' })}
                <RadioDescription>{$t({ defaultMessage: 'Including any AP that will be added to this venue in the future.' })}</RadioDescription>
              </Radio>
              <Form.Item noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.selectionType !== currentValues.selectionType}>
                { ({ getFieldValue }) => getFieldValue('selectionType') === 0 && (
                  <div style={style}>
                    <Form.Item label={$t({ defaultMessage: 'VLAN' })} labelCol={{ span: 5 }}>
                      {`${defaultVlanString.vlanPrefix}${defaultVlanString.vlanString}`} {$t({ defaultMessage: '(Default)' })}
                    </Form.Item>
                    <Form.Item name='allApGroupsRadioTypes'
                      label={$t({ defaultMessage: 'Radio Band' })}
                      labelCol={{ span: 5 }}>
                      <RadioSelect />
                    </Form.Item>
                  </div>
                )}
              </Form.Item>

              <Radio value={1}>{$t({ defaultMessage: 'Select specific AP groups' })}
                <RadioDescription>{$t({ defaultMessage: 'Including any AP that will be added to a selected AP group in the future.' })}</RadioDescription>
              </Radio>
              <Form.List name='apgroups'>
                { (fields, { add, remove }) => (
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
                <RadioDescription>{$t({ defaultMessage: 'This network will be only applied to APs with the tags.' })}</RadioDescription>
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
                      onChange={handleTagChange}
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