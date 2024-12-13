import { useContext, useEffect, useState } from 'react'

import { Form, InputNumber } from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { cloneDeep }         from 'lodash'
import { useIntl }           from 'react-intl'

import { Drawer, Select }                                       from '@acx-ui/components'
import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { IsNetworkSupport6g, Network, RadioTypeEnum, VlanType } from '@acx-ui/rc/utils'

import { getCurrentVenue } from '../../ApGroupNetworkTable'

import { ApGroupVlanRadioContext } from './index'


export type ApGroupVlanRadioDrawerState = {
  visible: boolean,
  editData: Network
}

type EditApGroup = {
  vlanType: VlanType
  vlanId?: number
  vlanPoolId?: string
  radioTypes?: RadioTypeEnum[]
}

const defaultEditApGroup: EditApGroup = {
  vlanType: VlanType.VLAN,
  vlanId: 1,
  radioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz]
}

const getCurrentAPGroup = (editData: Network, venueId: string, apGroupId: string) => {
  const currentVenue = getCurrentVenue(editData, venueId)
  const { isAllApGroups, apGroups } = currentVenue || {}

  if (!isAllApGroups && Array.isArray(apGroups)) {
    return apGroups.find((apGroup) => apGroup.apGroupId === apGroupId)
  }

  return undefined
}

// eslint-disable-next-line max-len
const getApGroupData = (editData: Network, venueId: string, apGroupId: string) => {

  const wlan = editData?.deepNetwork?.wlan

  const findApGroup = getCurrentAPGroup(editData, venueId, apGroupId)
  if (findApGroup) {
    const {
      vlanId: apGroupVlanId,
      vlanPoolId: apGroupVlanPoolId,
      radioTypes=[] } = findApGroup

    const wlanVlanId = wlan?.vlanId || 1
    const {
      id: wlanVlanPoolId
    } = wlan?.advancedCustomization?.vlanPool || {}

    const vlanId = apGroupVlanId || wlanVlanId
    const vlanPoolId = apGroupVlanPoolId || wlanVlanPoolId || ''

    const vlanType = (!vlanPoolId)? VlanType.VLAN : VlanType.Pool

    return {
      vlanType,
      vlanId,
      vlanPoolId,
      radioTypes } as EditApGroup
  }

  return defaultEditApGroup
}

const radioTypeEnumToString = (radioType: RadioTypeEnum) => {
  return radioType.replace(/-/g, ' ') //FIXME: useIntl
}

const IsSupport6g = (editData: Network, options?: Record<string, boolean>) => {
  const network = editData?.deepNetwork
  return IsNetworkSupport6g(network, options)
}

// eslint-disable-next-line max-len
export function ApGroupVlanRadioDrawer ({ updateData }: { updateData: (data: Network, oldData: Network) => void }) {
  const { $t } = useIntl()
  const isSupport6gOWETransition = useIsSplitOn(Features.WIFI_OWE_TRANSITION_FOR_6G)

  const { venueId, apGroupId,
    drawerStatus, setDrawerStatus, vlanPoolingNameMap } = useContext(ApGroupVlanRadioContext)
  const { visible, editData } = drawerStatus || {}

  const [form] = Form.useForm()
  const vlanType = Form.useWatch('vlanType', form)

  const [editingApGroup, setEditingAgGroup] = useState<EditApGroup>(defaultEditApGroup)
  const [isSupport6G, setIsSupport6G] = useState(true)

  const disabledBandTooltip = $t({
    // eslint-disable-next-line max-len
    defaultMessage: '6GHz disabled for non-WPA3 networks. To enable 6GHz operation, configure a WLAN for WPA3 operation.'
  })

  useEffect(() => {
    if (visible && editData) {
      const data = cloneDeep(editData)
      const initApGroupData = getApGroupData(data, venueId, apGroupId)
      setEditingAgGroup(initApGroupData)
      setIsSupport6G(IsSupport6g(data, { isSupport6gOWETransition }))
      form.setFieldsValue({
        ...initApGroupData
      })
    }
  }, [visible, editData])

  const vlanPoolOptions = vlanPoolingNameMap?.map(vp => ({ label: vp.value, value: vp.key })) ?? []

  const formContent = (
    <Form form={form} layout='vertical'>
      <Form.Item
        label={$t({ defaultMessage: 'Selected Network' })}
        children={<span>{editData?.name || ''}</span>}
      />
      <Form.Item
        name='vlanType'
        label={$t({ defaultMessage: 'VLAN' })}
        children={
          <Select
            style={{ width: '250px' }}>
            <Select.Option value={VlanType.Pool}>{$t({ defaultMessage: 'Pool' })}</Select.Option>
            <Select.Option value={VlanType.VLAN}>{$t({ defaultMessage: 'VLAN' })}</Select.Option>
          </Select>}
      />
      {vlanType === VlanType.VLAN ? (
        <Form.Item
          name='vlanId'
          label={$t({ defaultMessage: 'VLANs' })}
          rules={[
            { required: true }
          ]}
          children={
            <InputNumber
              max={4094}
              min={1}
              controls={false}
              value={editingApGroup.vlanId}
              style={{ width: '250px' }}
            />
          } />
      ) : (
        <Form.Item
          name='vlanPoolId'
          label={$t({ defaultMessage: 'VLAN Pool' })}
          rules={[{ required: true }]}
          children={
            <Select
              placeholder={$t({ defaultMessage: 'Select profile...' })}
              options={vlanPoolOptions as unknown as DefaultOptionType[]}
              style={{ width: '250px' }} />
          } />
      )}
      <Form.Item
        name='radioTypes'
        label={$t({ defaultMessage: 'Radios' })}
        rules={[
          { required: true }
        ]}
        children={
          <Select
            mode='multiple'
            showArrow
            style={{ width: '250px' }}
          >
            <Select.Option value={RadioTypeEnum._2_4_GHz} >
              {radioTypeEnumToString(RadioTypeEnum._2_4_GHz)}
            </Select.Option>
            <Select.Option value={RadioTypeEnum._5_GHz}>
              {radioTypeEnumToString(RadioTypeEnum._5_GHz)}
            </Select.Option>
            <Select.Option
              value={RadioTypeEnum._6_GHz}
              disabled={!isSupport6G}
              title={!isSupport6G ? disabledBandTooltip : ''}
            >
              {radioTypeEnumToString(RadioTypeEnum._6_GHz)}
            </Select.Option>
          </Select>
        }
      />
    </Form>
  )

  const onClose = () => {
    setDrawerStatus({
      visible: false,
      editData: {} as Network
    })
    form.resetFields()
  }

  const onSubmit = async () => {
    try {
      await form.validateFields()
      const { vlanType, vlanId, vlanPoolId, radioTypes } = form.getFieldsValue()

      // update AP group Data
      const newData = cloneDeep(editData)

      const newApGroup = getCurrentAPGroup(newData, venueId, apGroupId)
      if (newApGroup) {
        if (vlanType === VlanType.VLAN) {
          newApGroup.vlanId = vlanId
          delete newApGroup.vlanPoolId
        } else { // vlanPool
          newApGroup.vlanPoolId = vlanPoolId
          delete newApGroup.vlanId
        }
        newApGroup.radioTypes = radioTypes
      }
      updateData(newData, editData)
      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Edit VLAN & Radio' })}
      width={452}
      visible={visible}
      onClose={onClose}
      children={formContent}
      footer={
        <Drawer.FormFooter
          buttonLabel={{ save: $t({ defaultMessage: 'OK' }) }}
          onCancel={onClose}
          onSave={onSubmit}
        />
      }
    />
  )
}
