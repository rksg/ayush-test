import React from 'react'

import { Form, Input, Select }        from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'

import { Button }               from '@acx-ui/components'
import { DeleteOutlined }       from '@acx-ui/icons'
import { whitespaceOnlyRegExp } from '@acx-ui/rc/utils'

interface FieldType {
  value: string,
  label: string | MessageDescriptor
}

export function DataPromptField () {
  const { $t } = useIntl()
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

  return (
    <Form.List name={'fields'}>
      {(fields, { add, remove }) => {
        return (
          <>
            {fields.map((field, index) => (
              <div key={field.key}>
                <div key={`${index}`}
                  style={{ display: 'flex', flexDirection: 'row' }}>
                  <label style={{ width: '100%' }}>
                    {`Field ${index + 1}`}
                  </label>
                  <Button shape={'circle'}
                    icon={<DeleteOutlined />}
                    onClick={() => remove(field.name)}/>
                </div>

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
                  name={[field.name, 'type']}
                  label={$t({ defaultMessage: 'Field Type' })}
                  rules={[
                    { required: true },
                    { validator: (_, value) => whitespaceOnlyRegExp(value) }
                  ]}
                >
                  <Select options={fieldTypes} />
                </Form.Item>
              </div>
            ))}
            <Form.Item>
              <Button type={'link'}
                onClick={() => add()}
              >
                Add Field
              </Button>
            </Form.Item>
          </>
        )
      }}
    </Form.List>
  )
}
