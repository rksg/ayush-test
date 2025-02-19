import { useState } from 'react'

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
  const { value: propsValue, onChange } = props

  const [isEditMode, setEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [editingValue, setEditingValue] = useState<number>(propsValue)

  const handleEdit = () => {
    setEditingValue(propsValue)
    setEditMode(true)
  }

  const handleApply = () => {
    setIsSubmitting(true)

    onChange(editingValue)
      .catch(() => {
        handleResetValue()
      })
      .finally(() => {
        setIsSubmitting(false)
        setEditMode(false)
      })
  }

  const handleResetValue = () => {
    setEditingValue(propsValue)
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
        <label>{propsValue ? propsValue : noDataDisplay}</label>
        <Button type='link' icon={<EditOutlined />} onClick={()=>{handleEdit()}}></Button>
      </>
      )}
    </Space>
  )
}