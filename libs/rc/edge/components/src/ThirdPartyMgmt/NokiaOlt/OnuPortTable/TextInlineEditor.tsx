import { useEffect, useState } from 'react'

import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import {
  InputNumber,
  Space
} from 'antd'

import { Button }        from '@acx-ui/components'
import { noDataDisplay } from '@acx-ui/utils'

import { StyledFormItem } from './styledComponents'

interface TextInlineEditorProps {
  value: number,
  onChange: (data: number) => Promise<void>,
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
    setIsSubmitting(true)

    onChange(editingValue)
      .then(() => {
        setInitialValue(editingValue)
      })
      .catch(() => {
        handleResetValue()
      })
      .finally(() => {
        setIsSubmitting(false)
        setEditMode(false)
      })
  }

  const handleResetValue = () => {
    setEditingValue(initialValue)
  }

  const handleCancel = () => {
    handleResetValue()
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
        <label>{editingValue ? editingValue : noDataDisplay}</label>
        <Button type='link' icon={<EditOutlined />} onClick={()=>{handleEdit()}}></Button>
      </>
      )}
    </Space>
  )
}