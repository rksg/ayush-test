import { Divider, Form, Input, Select, Switch } from 'antd'
import { MessageDescriptor, useIntl }           from 'react-intl'

import { Button }                                                   from '@acx-ui/components'
import { DeleteOutlined, DeleteOutlinedDisabledIcon }               from '@acx-ui/icons'
import { ActionType, DataPromptVariable, trailingNorLeadingSpaces } from '@acx-ui/rc/utils'

import { CommonActionSettings } from './CommonActionSettings'
import { FieldLabel }           from './styledComponents'



interface FieldType {
  value: string,
  label: string | MessageDescriptor
}

function DataPromptField () {

  const form = Form.useFormInstance()

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
      (item && item.type === selectedType) ).length > 1) {
      return Promise.reject($t({ defaultMessage: 'Field type already selected' }))
    }

    return Promise.resolve()
  }

  const validateDuplicateName = (label: string) => {

    const formFields = form.getFieldValue('variables')

    let nameCount = 0
    if(formFields && formFields.length > 0) {
      //@ts-ignore
      formFields.forEach(field => field?.label === label ? nameCount++ : 1)
    }

    if (label && nameCount > 1) {
      return Promise.reject($t({ defaultMessage: 'Field label is already in use.' }))
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
                  {$t({ defaultMessage: 'Field {num}' }, { num: index + 1 })}
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
                    { validator: (_, value) => trailingNorLeadingSpaces(value) },
                    { validator: (_, value) => validateDuplicateName(value) }
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
                disabled={variables.length > 10}
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

export function DataPromptSettings () {
  const { $t } = useIntl()
  const { useWatch } = Form
  const showTitle = useWatch<boolean>('displayTitle')
  const showIntroText = useWatch<boolean>('displayMessageHtml')


  return (
    <>
      <CommonActionSettings actionType={ActionType.DATA_PROMPT} />
      <FieldLabel width='555px' >
        {$t({ defaultMessage: 'Title' })}
        <Form.Item key='displayTitle'
          data-testid={'displayTitle'}
          name={'displayTitle'}
          valuePropName={'checked'}
        >
          <Switch data-testid={'switch-title'}/>
        </Form.Item>
      </FieldLabel>
      { showTitle &&
        <Form.Item key={'title'}
          name={'title'}
          rules={[
            { required: true },
            { min: 2 },
            { max: 100 },
            { validator: (_, value) => trailingNorLeadingSpaces(value) }
          ]}
        >
          <Input placeholder={$t({ defaultMessage: 'Type your title here...' })}
            data-testid={'title'}/>
        </Form.Item>
      }
      <FieldLabel width='555px'>
        {$t({ defaultMessage: 'Intro text' })}
        <Form.Item key='displayMessageHtml'
          data-testid={'displayMessageHtml'}
          name={'displayMessageHtml'}
          valuePropName={'checked'}
        >
          <Switch data-testid={'switch-messageHtml'}/>
        </Form.Item>
      </FieldLabel>
      { showIntroText &&
        <Form.Item key='messageHtml'
          name={'messageHtml'}
          rules={[
            { required: true, message: $t({ defaultMessage: 'Please enter page intro text' }) },
            { min: 2 },
            { max: 1000 },
            { validator: (_, value) => trailingNorLeadingSpaces(value) }
          ]}
        >
          <Input.TextArea rows={8}
            placeholder={$t({ defaultMessage: 'Type your message here...' })}
            data-testid={'messageHtml'} />
        </Form.Item>
      }

      <Divider dashed={true} />

      <DataPromptField />

      <Form.Item
        name={'backButtonText'}
        hidden={true}
        children={<Input />}
      />
      <Form.Item
        name={'continueButtonText'}
        hidden={true}
        children={<Input />}
      />
      <Form.Item
        name={'displayBackButton'}
        hidden={true}
        children={<Input />}
      />
      <Form.Item
        name={'displayContinueButton'}
        hidden={true}
        children={<Input />}
      />
    </>
  )
}
