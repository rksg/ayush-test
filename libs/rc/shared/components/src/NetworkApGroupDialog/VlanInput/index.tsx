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
  getVlanPool,
  getVlanString,
  NetworkApGroup,
  NetworkSaveData,
  vlanContents,
  VlanPool,
  VlanType
} from '@acx-ui/rc/utils'

import { VlanDate } from '../index'

export function VlanInput ({ apgroup, wlan, vlanPoolSelectOptions, onChange, selected }: {
  apgroup: NetworkApGroup,
  wlan?: NetworkSaveData['wlan'],
  vlanPoolSelectOptions?: VlanPool[],
  onChange: (data: VlanDate) => void,
  selected: boolean
}) {
  const { $t } = useIntl()

  const [isEditMode, setEditMode] = useState(false)
  const [isDirty, setDirty] = useState(false)

  const apGroupVlanId = apgroup?.vlanId || wlan?.vlanId
  const apGroupVlanType = apgroup?.vlanId ? VlanType.VLAN : VlanType.Pool
  const apGroupVlanPool = apGroupVlanType === VlanType.Pool
    ? getVlanPool(apgroup, wlan, vlanPoolSelectOptions)
    : null

  const initVlanData = {
    vlanId: apGroupVlanId,
    vlanPool: apGroupVlanType === VlanType.Pool ? apGroupVlanPool : null,
    vlanType: apGroupVlanType
  }
  const [selectedVlan, setSelectedVlan] = useState<VlanDate>(initVlanData)
  const [editingVlan, setEditingVlan] = useState<VlanDate>(initVlanData)
  const [vlanLabel, setVlanLabel] = useState(getVlanString(initVlanData.vlanPool, initVlanData.vlanId, initVlanData.vlanId !== 1).vlanText)
  const [disabledApply, setDisabledApply] = useState(false)

  useEffect(() => {
    setSelectedVlan(_.cloneDeep(initVlanData))
    setEditingVlan(_.cloneDeep(initVlanData))
  }, [apgroup, wlan])

  useEffect(() => {
    // onChange(selectedVlan)
    const { vlanType, vlanPool, vlanId=1 } = selectedVlan
    const isVlanPool = vlanType === VlanType.Pool
    let label = ''
    if (isVlanPool) {
      const defaultValue = wlan?.advancedCustomization?.vlanPool?.id ?? ''
      label = $t(vlanContents.vlanPool, {
        poolName: vlanPool?.name,
        isCustom: vlanPool && (vlanPool.id !== defaultValue)
      })
    } else {
      const defaultValue = wlan?.vlanId ?? 1
      label = $t(vlanContents.vlan, {
        id: vlanId.toString(),
        isCustom: vlanId && (vlanId !== defaultValue)
      })
    }

    setVlanLabel(label)
    setDirty(!_.isEqual(selectedVlan, initVlanData))
  }, [selectedVlan])

  useEffect(() => {
    if (editingVlan.vlanType === VlanType.VLAN) {
      setDisabledApply(!editingVlan.vlanId)
    } else if (editingVlan.vlanType === VlanType.Pool) {
      setDisabledApply(!editingVlan.vlanPool)
    }
  }, [editingVlan])

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

  const isPoolType = editingVlan.vlanType === VlanType.Pool
  if (!selected) {
    return <></>
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
              value={{
                value: isPoolType ? editingVlan.vlanPool?.id || '' : '',
                label: isPoolType ? editingVlan.vlanPool?.name || '' : ''
              }}
              fieldNames={{ label: 'name', value: 'id' }}
              // value={editingVlan.vlanPool}
              placeholder={$t({ defaultMessage: 'Select profile...' })}
              options={vlanPoolSelectOptions}
              style={{ width: '88px' }} />
          )}
          <Button type='link' icon={<CheckOutlined />} disabled={disabledApply} onClick={()=>{handleApply()}}></Button>
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
