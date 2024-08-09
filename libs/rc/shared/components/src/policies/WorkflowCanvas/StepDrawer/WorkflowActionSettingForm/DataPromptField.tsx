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
  const fieldTypes: FieldType[] = [
    { value: 'USER_NAME', label: $t({ defaultMessage: 'Username' }) }
    , { value: 'EMAIL', label: $t({ defaultMessage: 'Email Address' }) }
    , { value: 'PHONE', label: $t({ defaultMessage: 'Phone Number' }) }
    , { value: 'FIRST_NAME', label: $t({ defaultMessage: 'First Name' }) }
    , { value: 'LAST_NAME', label: $t({ defaultMessage: 'Last Name' }) }
    , { value: 'INPUT_FIELD_1', label: $t({ defaultMessage: 'Custom Field 1' }) }
    , { value: 'INPUT_FIELD_2', label: $t({ defaultMessage: 'Custom Field 2' }) }
    , { value: 'INPUT_FIELD_3', label: $t({ defaultMessage: 'Custom Field 3' }) }
    , { value: 'INPUT_FIELD_4', label: $t({ defaultMessage: 'Custom Field 4' }) }
    , { value: 'INPUT_FIELD_5', label: $t({ defaultMessage: 'Custom Field 5' }) }
    , { value: 'INPUT_FIELD_6', label: $t({ defaultMessage: 'Custom Field 6' }) }]


  const selectedTypes = Form.useWatch<DataPromptVariable[]>('variables')
  const validateDuplicateType = (selectedType: string) => {

    if (selectedTypes.filter(item =>
      (item && item.type === selectedType) ? true : false ).length > 1) {
      return Promise.reject($t({ defaultMessage: 'Field type already selected' }))
    }

    return Promise.resolve()
  }
  return (
    <Form.List name={'variables'}>
      {(variables, { add, remove }) => {
        return (
          <>
            {variables.map((field, index) => (
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
