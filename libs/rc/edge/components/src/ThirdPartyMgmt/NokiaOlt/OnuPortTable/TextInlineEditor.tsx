import { useEffect, useState } from 'react'

import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import {
  InputNumber,
  Space
} from 'antd'

import { Button } from '@acx-ui/components'

import { StyledFormItem } from './styledComponents'

interface TextInlineEditorProps {
  value: number,
  onChange: (data: number) => void,
}
export const TextInlineEditor = (props: TextInlineEditorProps) => {
  const { onChange } = props

  const [isEditMode, setEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [initialValue, setInitialValue] = useState<number>(props.value)
  const [editingValue, setEditingValue] = useState<number>(props.value)

  useEffect(() => {
    setEditingValue(initialValue)
  }, [initialValue])

  const handleEdit = () => {
    setEditingValue(editingValue)
    setEditMode(true)
  }

  const handleApply = () => {
    onChange(editingValue)
    setInitialValue(editingValue)
    setIsSubmitting(true)

    // TODO: trigger API and show loading icon
    setTimeout(() => {
      setIsSubmitting(false)
      setEditMode(false)
    }, 1000)
  }

  const handleCancel = () => {
    setEditingValue(initialValue)
    setEditMode(false)
  }

  const handleVlanChange = (vlan: number) => {
    setEditingValue(vlan)
  }

  return (
    <Space size={2}>
      { isEditMode ? (
        <>
          <StyledFormItem
            validateStatus={isSubmitting ? 'validating' : undefined}
            hasFeedback={isSubmitting}
          >
            <InputNumber
              max={4094}
              min={1}
              controls={false}
              onChange={handleVlanChange}
              value={editingValue}
              disabled={isSubmitting}
              style={{ width: '60px' }}
            />
          </StyledFormItem>
          <Button type='link'
            icon={<CheckOutlined />}
            disabled={isSubmitting}
            onClick={()=>{handleApply()}}
          />
          <Button type='link'
            icon={<CloseOutlined />}
            disabled={isSubmitting}
            onClick={()=>{handleCancel()}}
          />
        </>
      ) : (<>
        <label>{editingValue}</label>
        <Button type='link' icon={<EditOutlined />} onClick={()=>{handleEdit()}}></Button>
      </>
      )}
    </Space>
  )
}