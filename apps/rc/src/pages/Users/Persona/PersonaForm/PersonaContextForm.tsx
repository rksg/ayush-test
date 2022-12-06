import { useEffect } from 'react'

import { Form, FormInstance, Input, InputNumber, Select } from 'antd'
import TextArea                                           from 'antd/lib/input/TextArea'
import { useIntl }                                        from 'react-intl'

import { useGetPersonaGroupListQuery } from '@acx-ui/rc/services'
import { Persona }                     from '@acx-ui/rc/utils'
import { validationMessages }          from '@acx-ui/utils'


import { PersonaCreateMode } from './index'


export function PersonaContextForm (props: {
  form: FormInstance,
  mode: PersonaCreateMode
  defaultValue?: Partial<Persona>,
  onGroupChange: (id: string) => void
}) {
  const { $t } = useIntl()
  const { form, defaultValue, mode, onGroupChange } = props
  const isCreateFromFile = mode === PersonaCreateMode.FromFile

  useEffect(() => {
    if (defaultValue) {
      form.setFieldsValue(defaultValue)
    }
  }, [defaultValue])

  const personaGroupList = useGetPersonaGroupListQuery({
    params: { size: '2147483647', page: '0' }
  })

  const emailRegExp = (value: string) => {
    // TODO: extract email validation to utils
    const reg = new RegExp('^[a-zA-Z0-9_!#$%&\'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$')

    if (!value) return Promise.resolve()

    if (value && value.trim() && reg.test(value)) {
      return Promise.resolve()
    } else {
      return Promise.reject('Please enter a valid email address')
    }
  }

  return (
    <Form
      form={form}
      name={'personaForm'}
      layout={'vertical'}
      initialValues={defaultValue}
    >
      <Form.Item
        hidden={isCreateFromFile}
        name='name'
        label={$t({ defaultMessage: 'Persona Name' })}
        rules={[
          { required: !isCreateFromFile }
        ]}
        children={<Input />}
      />
      <Form.Item
        hidden={isCreateFromFile}
        name='email'
        label={$t({ defaultMessage: 'Email' })}
        rules={[{
          validator: (_, value) => emailRegExp(value)
        }]}
        children={<Input />}
      />
      <Form.Item
        hidden={isCreateFromFile}
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        children={<TextArea rows={3} maxLength={64} />}
      />
      <Form.Item
        name='groupId'
        label={$t({ defaultMessage: 'Persona Group' })}
        rules={[
          { required: true }
        ]}
        children={
          <Select
            onChange={onGroupChange}
            disabled={!!defaultValue?.groupId}
            options={
              personaGroupList.data?.content
                .map(group => ({ value: group.id, label: group.name }))}
          />
        }
      />
      <Form.Item
        hidden={isCreateFromFile}
        name='vlan'
        label={$t({ defaultMessage: 'VLAN' })}
        children={<InputNumber style={{ width: '100%' }}/>}
        rules={[
          {
            type: 'number',
            min: 1,
            max: 4094,
            message: $t(validationMessages.vlanRange)
          }
        ]}
      />
    </Form>
  )
}
