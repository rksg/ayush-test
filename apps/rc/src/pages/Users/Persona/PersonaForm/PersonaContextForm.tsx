import { useEffect } from 'react'

import { Form, FormInstance, Input, InputNumber } from 'antd'
import TextArea                                   from 'antd/lib/input/TextArea'
import { useIntl }                                from 'react-intl'

import { PersonaGroupSelect }                         from '@acx-ui/rc/components'
import { useLazySearchPersonaListQuery }              from '@acx-ui/rc/services'
import { checkObjectNotExists, emailRegExp, Persona } from '@acx-ui/rc/utils'
import { validationMessages }                         from '@acx-ui/utils'



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
  const [searchPersonaList] = useLazySearchPersonaListQuery()

  const nameValidator = async (name: string) => {
    try {
      const list = (await searchPersonaList({
        params: { size: '2147483647', page: '0' },
        payload: { keyword: name }
      }, true).unwrap()).data.filter(p => p.id !== defaultValue?.id).map(p => ({ name: p.name }))
      return checkObjectNotExists(list, { name } , $t({ defaultMessage: 'Persona' }))
    } catch (e) {
      return Promise.resolve()
    }
  }

  useEffect(() => {
    if (defaultValue) {
      form.setFieldsValue(defaultValue)
    }
  }, [defaultValue])

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
        hasFeedback
        validateFirst
        validateTrigger={['onBlur']}
        rules={[
          { required: !isCreateFromFile },
          { validator: (_, value) => nameValidator(value) }
        ]}
        children={<Input />}
      />
      <Form.Item
        hidden={isCreateFromFile}
        name='email'
        label={$t({ defaultMessage: 'Email' })}
        rules={[
          { validator: (_, value) => emailRegExp(value) }]}
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
          <PersonaGroupSelect
            onChange={onGroupChange}
            disabled={!!defaultValue?.groupId}
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
