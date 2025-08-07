import { useContext, useEffect, useState } from 'react'

import { Checkbox, Form, InputNumber } from 'antd'
import { CheckboxChangeEvent }         from 'antd/lib/checkbox'
import { DefaultOptionType }           from 'antd/lib/select'
import { cloneDeep }                   from 'lodash'
import { useIntl }                     from 'react-intl'

import { cssStr, Drawer, Select, Tooltip }                      from '@acx-ui/components'
import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { IsNetworkSupport6g, Network, RadioTypeEnum, VlanType } from '@acx-ui/rc/utils'

import VLANPoolModal from '../NetworkForm/VLANPoolInstance/VLANPoolModal'

import { getCurrentVenue }                from './index'
import { ApGroupNetworkVlanRadioContext } from './index'

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

const getApGroupData = (editData: Network, venueId: string, apGroupId: string) => {

  const wlan = editData?.deepNetwork?.wlan

  const findApGroup = getCurrentAPGroup(editData, venueId, apGroupId)
  if (!findApGroup) return defaultEditApGroup

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

const radioTypeEnumToString = (radioType: RadioTypeEnum) => {
  return radioType.replace(/-/g, ' ') //FIXME: useIntl
}

const IsSupport6g = (editData: Network, options?: Record<string, boolean>) => {
  const network = editData?.deepNetwork
  return IsNetworkSupport6g(network, options)
}

// eslint-disable-next-line max-len
export function ApGroupNetworkVlanRadioDrawer ({ updateData }: { updateData: (data: Network[], oldData: Network[]) => void }) {
  const { $t } = useIntl()
  const isSupport6gOWETransition = useIsSplitOn(Features.WIFI_OWE_TRANSITION_FOR_6G)
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase1Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE1_TOGGLE)

  const { venueId, apGroupId,
    drawerStatus, setDrawerStatus, vlanPoolingNameMap } = useContext(ApGroupNetworkVlanRadioContext)
  const { visible, editData } = drawerStatus || {}

  const [form] = Form.useForm()
  const vlanType = Form.useWatch('vlanType', form)

  const [editingApGroup, setEditingAgGroup] = useState<EditApGroup>(defaultEditApGroup)
  const [isSupport6G, setIsSupport6G] = useState(true)
  const [vlanChecked, setVlanChecked] = useState(false)
  const [radioChecked, setRadioChecked] = useState(false)

  const disabledBandTooltip = $t({
    // eslint-disable-next-line max-len
    defaultMessage: '6GHz disabled for non-WPA3 networks. To enable 6GHz operation, configure a WLAN for WPA3 operation.'
  })

  // eslint-disable-next-line max-len
  const MultipleValues = <div style={{ color: cssStr('--acx-accents-orange-50'), fontStyle: 'oblique' }}>
    {$t({ defaultMessage: 'Multiple values' })}
  </div>

  useEffect(() => {
    if (visible && editData) {
      const data = cloneDeep(editData[0])
      const initApGroupData = getApGroupData(data, venueId, apGroupId)
      setEditingAgGroup(initApGroupData)
      setIsSupport6G(IsSupport6g(data, { isSupport6gOWETransition }))
      form.setFieldsValue({
        ...initApGroupData
      })
    }
  }, [visible, editData])

  const [ vlanPoolList, setVlanPoolList ]= useState<DefaultOptionType[]>()

  useEffect(() => {
    if (vlanPoolingNameMap) {
      setVlanPoolList(vlanPoolingNameMap.map(vp => ({ label: vp.value, value: vp.key })))
    }
  }, [vlanPoolingNameMap])

  const handleVlanTypeChange = (e: CheckboxChangeEvent) => {
    setVlanChecked(e.target.checked)
  }

  const handleRadioTypeChange = (e: CheckboxChangeEvent) => {
    setRadioChecked(e.target.checked)
  }

  const formContent = (
    <Form form={form} layout='vertical'>
      <Form.Item
        label={$t({ defaultMessage: 'Selected Network' })}
        children={<span>{editData?.map(network => network.name).join(', ') || ''}</span>}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
        <Form.Item
          name='vlanType'
          label={editData.length > 1 ? <Checkbox
            onChange={handleVlanTypeChange}
            checked={vlanChecked}
          >
            {$t({ defaultMessage: 'VLAN' })}
          </Checkbox> : $t({ defaultMessage: 'VLAN' })}
          style={{ flex: '0 0 auto', minWidth: '100px' }}
          children={editData.length > 1 && !vlanChecked
            ? MultipleValues
            : <Select
              style={{ width: '100px' }}>
              <Select.Option value={VlanType.Pool}>{$t({ defaultMessage: 'Pool' })}</Select.Option>
              <Select.Option value={VlanType.VLAN}>{$t({ defaultMessage: 'VLAN' })}</Select.Option>
            </Select>}
        />
        {!(editData.length > 1 && !vlanChecked) && vlanType === VlanType.VLAN ? (
          <Form.Item
            name='vlanId'
            label={$t({ defaultMessage: 'VLANs' })}
            rules={[
              { required: true }
            ]}
            style={{ flex: '0 0 auto', minWidth: '187px' }}
            children={
              <InputNumber
                max={4094}
                min={1}
                controls={false}
                value={editingApGroup.vlanId}
                style={{ width: '187px' }}
              />
            } />
        ) : (!(editData.length > 1 && !vlanChecked) &&
          <Form.Item
            name='vlanPoolId'
            label={$t({ defaultMessage: 'VLAN Pool' })}
            rules={[{ required: true }]}
            style={{ flex: '0 0 auto', minWidth: '220px' }}
            children={
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Select
                  placeholder={$t({ defaultMessage: 'Select profile...' })}
                  options={vlanPoolList as unknown as DefaultOptionType[]}
                  style={{ width: '187px' }} />
                { isApGroupMoreParameterPhase1Enabled &&
                  <Tooltip>
                    <VLANPoolModal updateInstance={(data)=>{
                      vlanPoolList &&
                      setVlanPoolList([...vlanPoolList, { label: data.name, value: data.id }])
                      form.setFieldValue(['vlanPoolId'], data.id)
                    }}
                    vlanCount={vlanPoolList?.length||0}
                    />
                  </Tooltip>
                }
              </div>
            } />
        )}
      </div>

      <Form.Item
        name='radioTypes'
        label={editData.length > 1 ? <Checkbox
          onChange={handleRadioTypeChange}
          checked={radioChecked}
        >
          {$t({ defaultMessage: 'Radios' })}
        </Checkbox> : $t({ defaultMessage: 'Radios' })}
        rules={[
          { required: editData.length <= 1 }
        ]}
        children={
          editData.length > 1 && !radioChecked
            ? MultipleValues
            : <Select
              mode='multiple'
              showArrow
              style={{ width: '300px' }}
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
      editData: [] as Network[]
    })
    form.resetFields()
  }

  const onSubmit = async () => {
    try {
      await form.validateFields()
      const { vlanType, vlanId, vlanPoolId, radioTypes } = form.getFieldsValue()

      // update AP group Data
      const newData = cloneDeep(editData)

      for (let i = 0; i < newData.length; i++) {
        const newApGroup = getCurrentAPGroup(newData[i], venueId, apGroupId)
        if (newApGroup) {
          if (vlanType === VlanType.VLAN) {
            newApGroup.vlanId = vlanId
            delete newApGroup.vlanPoolId
          } else { // vlanPool
            newApGroup.vlanPoolId = vlanPoolId
            delete newApGroup.vlanId
          }
          newApGroup.radioTypes = radioTypes
        } else {
          const deepNetwork = newData[i].deepNetwork
          const venue = deepNetwork?.venues?.find(v => v.venueId === venueId)
          if (venue?.isAllApGroups) {
            venue.allApGroupsRadioTypes = radioTypes
          }
        }
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
