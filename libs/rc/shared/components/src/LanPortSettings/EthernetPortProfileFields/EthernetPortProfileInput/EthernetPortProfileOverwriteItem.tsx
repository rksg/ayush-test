import { useEffect, useState } from 'react'

import { CheckOutlined, CloseOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons'
import { Form, Input, Space, Tooltip }                                from 'antd'
import { Rule }                                                       from 'antd/lib/form'
import { useWatch }                                                   from 'antd/lib/form/Form'
import { ValidateErrorEntity }                                        from 'rc-field-form/es/interface'
import { useIntl }                                                    from 'react-intl'

import { Button, StepsForm } from '@acx-ui/components'


interface EthernetPortProfileOverwriteProps {
    title: string
    defaultValue: string
    initialData: string
    isEditable?: boolean
    fieldName: (string | number)[]
    width?: string
    rules?: Rule[]
    currentIndex: number,
    onGUIChanged?: (fieldName: string) => void
}

const EthernetPortProfileOverwriteItem = (props:EthernetPortProfileOverwriteProps) => {
  const { $t } = useIntl()
  const {
    title,
    defaultValue,
    initialData,
    isEditable=true,
    fieldName,
    width='200px',
    currentIndex,
    onGUIChanged,
    rules=[] } = props

  const form = Form.useFormInstance()
  const [isEditMode, setEditMode] = useState(false)
  const currentFieldValue = useWatch(fieldName, form)
  const inputFieldName = fieldName.join('_')
  const isDirty = (currentFieldValue?.toString() !== defaultValue)
  const lan = form?.getFieldValue('lan')?.[currentIndex]
  const hasVni = lan?.vni > 0

  useEffect(() => {
    if (currentFieldValue !== initialData ){
      form.setFieldValue(fieldName, initialData)
      form.setFieldValue(inputFieldName, initialData)
    }
  } ,[initialData])

  const handleEdit = () => {
    setEditMode(true)
    form.setFieldValue(inputFieldName, currentFieldValue)
  }

  const handleApply = () => {
    form.validateFields()
      .then(()=>{
        applyValues()
      })
      .catch((result:ValidateErrorEntity)=>{
        const isValid = !result.errorFields.some((item)=> {
          return item.name.includes(inputFieldName)
        })
        if (isValid) {
          applyValues()
        }
      })
  }

  const applyValues = () => {
    const appliedValue = form.getFieldValue(inputFieldName)
    form.setFieldValue(fieldName, appliedValue)
    setEditMode(false)
  }

  const handleCancel = () => {
    setEditMode(false)
  }

  const reset = () => {
    form.setFieldValue(fieldName, defaultValue)
    onGUIChanged?.(inputFieldName)
  }

  return (<>
    <Form.Item
      hidden
      name={fieldName}
      children={
        <Input />
      }
    />
    <StepsForm.FieldLabel width={width}>
      {$t({ defaultMessage: '{title}' }, { title })}
      { isEditMode &&
      <Space>
        <Form.Item
          name={inputFieldName}
          rules={rules}
        >
          <Input width={'100px'} style={{ minWidth: '60px' }} />
        </Form.Item>
        <Button
          type='link'
          icon={<CheckOutlined />}
          onClick={(e)=>{
            e.preventDefault()
            handleApply()}}
        />
        <Button
          type='link'
          icon={<CloseOutlined />}
          onClick={(e)=>{
            e.preventDefault()
            handleCancel()
          }}></Button>
      </Space>
      }
      { !isEditMode &&
        <Space>
          {currentFieldValue}{(isEditable && !hasVni) ? (isDirty? '(Custom)': '(Default)') : ''}
          { isEditable &&
            <>
              <Tooltip
                title={$t({ defaultMessage: 'Override the {title}' }, { title })}
                placement='top'>
                <Button
                  hidden={hasVni}
                  type='link'
                  icon={<EditOutlined />}
                  onClick={(e)=>{
                    e.preventDefault()
                    handleEdit()
                  }}
                />
              </Tooltip>

              { isDirty &&
              <Tooltip
                title={$t({
                  // eslint-disable-next-line max-len
                  defaultMessage: 'Reset to the default value specified by the selected port profile'
                })}
                placement='top'>
                <Button
                  type='link'
                  icon={<ReloadOutlined />}
                  onClick={(e)=>{
                    e.preventDefault()
                    reset()
                  }}
                />
              </Tooltip>
              }
            </>
          }
        </Space>
      }
    </StepsForm.FieldLabel>
  </>
  )
}

export default EthernetPortProfileOverwriteItem