import React from 'react'

import { Form, Input, Select }        from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'

import { Button }                                     from '@acx-ui/components'
import { DeleteOutlined, DeleteOutlinedDisabledIcon } from '@acx-ui/icons'
import { DataPromptVariable, whitespaceOnlyRegExp }   from '@acx-ui/rc/utils'

import { FieldLabel } from './styledComponents'

interface FieldType {
  value: string,
  label: string | MessageDescriptor
}

export function DataPromptField () {
  const { $t } = useIntl()
  const { useWatch } = Form
  const fieldTypes: FieldType[] = [
    { value: 'username', label: $t({ defaultMessage: 'Username' }) }
    , { value: 'email', label: $t({ defaultMessage: 'Email Address' }) }
    , { value: 'phoneNumber', label: $t({ defaultMessage: 'Phone Number' }) }
    , { value: 'firstName', label: $t({ defaultMessage: 'First Name' }) }
    , { value: 'lastName', label: $t({ defaultMessage: 'Last Name' }) }
    , { value: 'inputField1', label: $t({ defaultMessage: 'Custom Field 1' }) }
    , { value: 'inputField2', label: $t({ defaultMessage: 'Custom Field 2' }) }
    , { value: 'inputField3', label: $t({ defaultMessage: 'Custom Field 3' }) }
    , { value: 'inputField4', label: $t({ defaultMessage: 'Custom Field 4' }) }
    , { value: 'inputField5', label: $t({ defaultMessage: 'Custom Field 5' }) }
    , { value: 'inputField6', label: $t({ defaultMessage: 'Custom Field 6' }) }]


  const [selectedTypes] = [useWatch<DataPromptVariable[]>('fields')]
  const validateDuplicateType = (selctedType: string) => {
    if (selctedType) {
      if (selectedTypes.filter(item => item.type === selctedType).length > 1) {
        return Promise.reject($t({ defaultMessage: 'Field type already selected' }))
      }
    }
    return Promise.resolve()
  }
  return (
    <Form.List name={'fields'}>
      {(fields, { add, remove }) => {
        return (
          <>
            {fields.map((field, index) => (
              <div key={field.key} data-testid={'field'+index}>
                <FieldLabel width='555px' key={'label_'+index}>
                  {`${$t({ defaultMessage: 'Field' })} ${index + 1}`}
                  <Button
                    data-testid={'btn-remove_'+index}
                    disabled={index < 1}
                    type='link'
                    key={`btn-${index}`}
                    icon={(index >0) ? <DeleteOutlined/> : <DeleteOutlinedDisabledIcon/>}
                    onClick={() => remove(field.name)}/>
                </FieldLabel>
                <Form.Item {...field}
                  key={field.key + '_label'}
                  name={[field.name, 'label']}
                  label={$t({ defaultMessage: 'Label' })}
                  rules={[
                    { required: true },
                    { min: 3 },
                    { max: 50 },
                    { validator: (_, value) => whitespaceOnlyRegExp(value) }
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item {...field}
                  key={field.key + '_type'}
                  data-testid={field.key + '_type'}
                  name={[field.name, 'type']}
                  label={$t({ defaultMessage: 'Field Type' })}
                  rules={[
                    { required: true },
                    { validator: (_, value) => whitespaceOnlyRegExp(value) },
                    { validator: (_, value) => validateDuplicateType(value) }
                  ]}
                >
                  <Select disabled={index < 1} options={fieldTypes} />
                </Form.Item>
              </div>
            ))}
            <Form.Item>
              <Button type={'link'}
                onClick={() => add()}
              >
                {$t({ defaultMessage: 'Add Field' })}
              </Button>
            </Form.Item>
          </>
        )
      }}
    </Form.List>
  )
}
