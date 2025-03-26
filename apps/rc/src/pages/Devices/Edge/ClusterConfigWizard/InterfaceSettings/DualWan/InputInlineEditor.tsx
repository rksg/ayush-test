import { useState } from 'react'

import {
  Input,
  Space
} from 'antd'
import { useIntl } from 'react-intl'

import { Button }                                                        from '@acx-ui/components'
import { DeleteOutlined, EditOutlined, Check as CheckIcon, CloseSymbol } from '@acx-ui/icons'

import { StyledFormItem } from './styledComponents'

interface InputInlineEditorProps {
  value?: string
  index: number
  onChange?: (data: string) => Promise<void>
  onDelete: (index: number) => void
}
export const InputInlineEditor = (props: InputInlineEditorProps) => {
  const { $t } = useIntl()
  const { value: propsValue, index, onChange, onDelete } = props

  const [isEditMode, setEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [editingValue, setEditingValue] = useState<string | undefined>(propsValue)

  const handleEdit = () => {
    setEditingValue(propsValue)
    setEditMode(true)
  }
  const handleDelete = () => {
    onDelete(index)
  }

  const handleApply = () => {
    setIsSubmitting(true)

    try {
      onChange?.(editingValue ?? '')
    } catch(err) {
      handleResetValue()
    } finally {
      setIsSubmitting(false)
      setEditMode(false)
    }
  }

  const handleResetValue = () => {
    setEditingValue(propsValue)
  }

  const handleCancel = () => {
    // do remove when origin value is undefined
    if (!propsValue) {
      onDelete(index)
    }

    setEditMode(false)
  }

  return (
    <Space size={2}>
      { (isEditMode || !propsValue) ? (
        <>
          <StyledFormItem
            validateStatus={isSubmitting ? 'validating' : undefined}
            hasFeedback={isSubmitting}
          >
            <Input
              onChange={(event) => {
                setEditingValue(event.target.value)
              }}
              value={editingValue}
              disabled={isSubmitting}
              style={{ minWidth: '200px' }}
              placeholder={$t({ defaultMessage: 'Enter the destination IP address' })}
            />
          </StyledFormItem>
          <Button type='link'
            icon={<CheckIcon />}
            disabled={isSubmitting}
            onClick={handleApply}
          />
          <Button type='link'
            icon={<CloseSymbol />}
            disabled={isSubmitting}
            onClick={handleCancel}
          />
        </>
      ) : (<>
        <label>{propsValue}</label>
        <Button type='link' icon={<EditOutlined />} onClick={handleEdit}/>
        <Button type='link' icon={<DeleteOutlined />} onClick={handleDelete}/>
      </>
      )}
    </Space>
  )
}