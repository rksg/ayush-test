/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { EditOutlined, ReloadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import {
  InputNumber,
  Space,
  Select
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button
} from '@acx-ui/components'
import {
  useVlanPoolListQuery
} from '@acx-ui/rc/services'
import {
  getVlanString,
  NetworkApGroup,
  NetworkSaveData,
  VlanType
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { VlanDate } from '../index'

export function VlanInput ({ apgroup, wlan, onChange }: { apgroup: NetworkApGroup, wlan?:NetworkSaveData['wlan'], onChange: (data: VlanDate) => void }) {
  const { $t } = useIntl()

  const [isEditMode, setEditMode] = useState(false)
  const [isDirty, setDirty] = useState(false)

  const apGroupVlanId = apgroup?.vlanId || wlan?.vlanId
  const apGroupVlanPool = apgroup?.vlanPoolId ? {
    name: apgroup.vlanPoolName || '',
    id: apgroup.vlanPoolId || '',
    vlanMembers: []
  } : wlan?.advancedCustomization?.vlanPool

  const apGroupVlanType = apGroupVlanPool ? VlanType.Pool : VlanType.VLAN

  const defaultVlanString = getVlanString(wlan?.advancedCustomization?.vlanPool, wlan?.vlanId)

  const initVlanData = { vlanId: apGroupVlanId, vlanPool: apGroupVlanPool, vlanType: apGroupVlanType }

  const [selectedVlan, setSelectedVlan] = useState<VlanDate>(initVlanData)
  const [editingVlan, setEditingVlan] = useState<VlanDate>(initVlanData)
  const [vlanLabel, setVlanLabel] = useState('')

  const { vlanPoolSelectOptions } = useVlanPoolListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        vlanPoolSelectOptions: data
      }
    }
  })

  useEffect(() => {
    // onChange(selectedVlan)
    const { vlanPrefix, vlanString, vlanType } = getVlanString(selectedVlan.vlanPool, selectedVlan.vlanId)
    const valueSuffix = _.isEqual({ vlanPrefix, vlanString, vlanType }, defaultVlanString) ? $t({ defaultMessage: '(Default)' }) : $t({ defaultMessage: '(Custom)' })
    setVlanLabel(`${vlanPrefix}${vlanString} ${valueSuffix}`)

    setDirty(!_.isEqual(selectedVlan, initVlanData))
  }, [selectedVlan])

  const handleVlanTypeChange = (value: VlanType) => {
    setEditingVlan({
      vlanId: editingVlan.vlanId,
      vlanPool: editingVlan.vlanPool,
      vlanType: value
    })
  }
  const handleVlanIdChange = (value: number) => {
    setEditingVlan({
      vlanId: value,
      vlanPool: editingVlan.vlanPool,
      vlanType: editingVlan.vlanType
    })
  }
  const handleVlanPoolChange = (value: { value: string; label: string }) => {
    setEditingVlan({
      vlanId: editingVlan.vlanId,
      vlanPool: {
        name: value.label,
        id: value.value,
        vlanMembers: []
      },
      vlanType: editingVlan.vlanType
    })
  }
  const handleEdit = () => {
    setEditingVlan(selectedVlan)
    setEditMode(true)
  }

  const handleApply = () => {
    let vlan = { ...editingVlan }
    vlan.vlanPool = vlan.vlanType === VlanType.VLAN ? undefined : vlan.vlanPool
    setSelectedVlan(vlan)
    onChange(vlan)

    setEditMode(false)
  }

  const handleCancel = () => {
    setEditingVlan(selectedVlan)
    setEditMode(false)
  }

  const reset = () => {
    setSelectedVlan(initVlanData)
    onChange(initVlanData)
  }

  return (
    <Space size='small'>
      { isEditMode ? (
        <>
          <Select onChange={handleVlanTypeChange} value={editingVlan.vlanType} placeholder={$t({ defaultMessage: 'Type' })}>
            <Select.Option value={VlanType.Pool}>{$t({ defaultMessage: 'Pool' })}</Select.Option>
            <Select.Option value={VlanType.VLAN}>{$t({ defaultMessage: 'VLAN' })}</Select.Option>
          </Select>
          { editingVlan.vlanType === VlanType.VLAN ? (
            <InputNumber max={4094} min={1} controls={false} onChange={handleVlanIdChange} value={editingVlan.vlanId}/>
          ) : (
            <Select labelInValue
              onChange={handleVlanPoolChange}
              fieldNames={{ label: 'name', value: 'id' }}
              // value={editingVlan.vlanPool}
              placeholder={$t({ defaultMessage: 'Select profile...' })}
              options={vlanPoolSelectOptions}
              style={{ width: '88px' }} />
          )}
          <Button type='link' icon={<CheckOutlined />} onClick={()=>{handleApply()}}></Button>
          <Button type='link' icon={<CloseOutlined />} onClick={()=>{handleCancel()}}></Button>
        </>
      ) : (
        <>
          <label>{vlanLabel}</label>
          <Button type='link' icon={<EditOutlined />} onClick={()=>{handleEdit()}}></Button>
          { isDirty && (<Button type='link' icon={<ReloadOutlined />} onClick={()=>{reset()}}></Button>) }
        </>
      )}
    </Space>
  )
}
