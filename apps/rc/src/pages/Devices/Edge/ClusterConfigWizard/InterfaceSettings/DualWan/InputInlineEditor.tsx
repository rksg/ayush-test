import { useEffect, useState } from 'react'

import { Input, Space } from 'antd'
import { useIntl }      from 'react-intl'

import { Button }             from '@acx-ui/components'
import { Check as CheckIcon } from '@acx-ui/icons'

import { StyledFormItem, DeleteOutlinedIcon, EditOutlinedIcon, CloseSymbolIcon } from './styledComponents'

interface InputInlineEditorProps {
  value?: string
  index: number
  onChange?: (data: string) => Promise<void>
  onDelete: (index: number) => void
  rules?: ((val: string) => Promise<string|undefined|void>)[]
}
export const InputInlineEditor = (props: InputInlineEditorProps) => {
  const { $t } = useIntl()
  const { value: propsValue, index, onChange, onDelete, rules } = props

  const [isEditMode, setEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validateErrMsg, setValidateErrMsg] = useState<string|undefined>(undefined)
  const [editingValue, setEditingValue] = useState<string | undefined>(propsValue)

  const isValidateError = !!validateErrMsg

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

  useEffect(() => {
    if (!rules?.length) return

    Promise.all(rules.map((rule) => rule(editingValue ?? '')))
      .then(() => {
      // reset error message
        setValidateErrMsg(undefined)
      })
      .catch((err) => {
        setValidateErrMsg(err)
      })

  }, [editingValue])

  return (
    <Space size={2}>
      { (isEditMode || !propsValue) ? (
        <>
          <StyledFormItem
            validateStatus={isSubmitting ? 'validating' : (validateErrMsg?'error':undefined)}
            hasFeedback={isSubmitting}
            help={validateErrMsg}
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
            disabled={isSubmitting || isValidateError || !editingValue}
            onClick={handleApply}
          />
          <Button type='link'
            icon={<CloseSymbolIcon />}
            disabled={isSubmitting}
            onClick={handleCancel}
          />
        </>
      ) : (<>
        <label>{propsValue}</label>
        <Button type='link' icon={<EditOutlinedIcon />} onClick={handleEdit}/>
        <Button type='link' icon={<DeleteOutlinedIcon />} onClick={handleDelete}/>
      </>
      )}
    </Space>
  )
}