import { useEffect, useState } from 'react'

import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import {
  InputNumber,
  Space
} from 'antd'

import { Button } from '@acx-ui/components'

interface TextInlineEditorProps {
  value: NetworkApGroup,
  onChange: (data: VlanDate) => void,
}
export const TextInlineEditor = (props: TextInlineEditorProps) => {
  const { value: initialValue, onChange } = props

  const [isEditMode, setEditMode] = useState(false)

  const [editingValue, setEditingValue] = useState<VlanDate>(initialValue)
  const [disabledApply, setDisabledApply] = useState(false)

  useEffect(() => {
    if (editingVlan.vlanType === VlanType.VLAN) {
      setDisabledApply(!editingVlan.vlanId)
    } else if (editingVlan.vlanType === VlanType.Pool) {
      setDisabledApply(!editingVlan.vlanPool)
    }
  }, [editingVlan])

  const handleEdit = () => {
    setEditingValue(editingValue)
    setEditMode(true)
  }

  const handleApply = () => {
    onChange(vlan)

    setEditMode(false)
  }

  const handleCancel = () => {
    setEditingValue(editingValue)
    setEditMode(false)
  }

  return (
    <Space size='small'>
      { isEditMode ? (
        <>
          <InputNumber
            max={4094}
            min={1}
            controls={false}
            onChange={handleVlanIdChange}
            value={editingValue}
          />
          <Button type='link'
            icon={<CheckOutlined />}
            disabled={disabledApply}
            onClick={()=>{handleApply()}}
          />
          <Button type='link'
            icon={<CloseOutlined />}
            onClick={()=>{handleCancel()}}
          />
        </>
      ) : (
        <>
          <label>{editingValue}</label>
          <Button type='link' icon={<EditOutlined />} onClick={()=>{handleEdit()}}></Button>
        </>
      )}
    </Space>
  )
}