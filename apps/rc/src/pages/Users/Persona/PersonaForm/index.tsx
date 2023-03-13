import React, { useEffect, useState } from 'react'

import { Form, FormInstance, Space } from 'antd'
import { useIntl }                   from 'react-intl'

import { Subtitle } from '@acx-ui/components'
import { Persona }  from '@acx-ui/rc/utils'


import { PersonaContextForm } from './PersonaContextForm'
import { PersonaDevicesForm } from './PersonaDevicesForm'


export function PersonaForm (props: {
  form: FormInstance,
  defaultValue?: Partial<Persona>
}) {
  const { $t } = useIntl()
  const { form, defaultValue } = props
  const [selectedGroupId, setSelectedGroupId] = useState('')

  useEffect(() => {
    if (defaultValue) {
      form.setFieldsValue(defaultValue)

      if (!defaultValue.groupId) return
      setSelectedGroupId(defaultValue?.groupId)
    }
  }, [defaultValue])

  return (
    <Space direction={'vertical'} size={20} style={{ display: 'flex' }}>
      <PersonaContextForm
        form={form}
        defaultValue={defaultValue}
        onGroupChange={setSelectedGroupId}
      />

      {!defaultValue?.id &&
          <>
            <Subtitle level={4}>{$t({ defaultMessage: 'Devices' })}</Subtitle>
            <Form
              form={form}
              name={'personaDevicesForm'}
              layout={'vertical'}
            >
              <Form.Item
                name={'devices'}
                children={<PersonaDevicesForm groupId={selectedGroupId}/>}
              />
            </Form>
          </>
      }
    </Space>
  )
}
