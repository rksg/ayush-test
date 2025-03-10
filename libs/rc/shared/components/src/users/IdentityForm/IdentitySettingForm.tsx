import React, { useEffect } from 'react'

import { Form, Input, InputNumber } from 'antd'
import TextArea                     from 'antd/lib/input/TextArea'
import { useIntl }                  from 'react-intl'
import { useParams }                from 'react-router-dom'

import { GridCol, GridRow }                                                         from '@acx-ui/components'
import { useLazySearchPersonaListQuery }                                            from '@acx-ui/rc/services'
import { checkObjectNotExists, emailRegExp, phoneRegExp, trailingNorLeadingSpaces } from '@acx-ui/rc/utils'
import { validationMessages }                                                       from '@acx-ui/utils'

import PhoneInput             from '../../PhoneInput'
import { PersonaGroupSelect } from '../PersonaGroupSelect'



export function IdentitySettingForm ({ modalMode } : { modalMode?: boolean }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { personaGroupId: defaultGroupId } = useParams()

  const id = Form.useWatch('id', form)
  const selectedGroupId = Form.useWatch('groupId', form)
  const [searchPersonaList] = useLazySearchPersonaListQuery()

  const nameValidator = async (name: string) => {
    try {
      if (!selectedGroupId) return Promise.resolve()
      const list = (await searchPersonaList({
        payload: { keyword: name, groupId: selectedGroupId, pageSize: '2147483647', page: '1' }
      }, true).unwrap()).data.filter(p => p.id !== id).map(p => ({ name: p.name }))
      return checkObjectNotExists(list, { name } , $t({ defaultMessage: 'Identity' }),
        'name', $t({ defaultMessage: 'in this identity group' }))
    } catch (e) {
      return Promise.resolve()
    }
  }

  useEffect(() => {
    if (defaultGroupId) {
      form.setFieldValue('groupId', defaultGroupId)
    }
  }, [defaultGroupId])

  return (
    <GridRow>
      <GridCol col={{ span: modalMode ? 8 : 6 }}>
        <Form.Item name='id' noStyle>
          <Input type='hidden' />
        </Form.Item>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Identity Name' })}
          hasFeedback
          validateFirst
          validateTrigger={['onBlur']}
          rules={[
            { required: true },
            { max: 255 },
            { validator: (_, value) => trailingNorLeadingSpaces(value) },
            { validator: (_, value) => nameValidator(value) }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='email'
          label={$t({ defaultMessage: 'Email' })}
          rules={[
            { max: 255 },
            { validator: (_, value) => emailRegExp(value) }]}
          children={<Input />}
        />
        <Form.Item
          name='phoneNumber'
          label={$t({ defaultMessage: 'Phone' })}
          validateFirst
          rules={[
            { validator: (_, value) => phoneRegExp(value) }
          ]}
          children={<PhoneInput
            name={'phoneNumber'}
            callback={(value: string) => {
              form.setFieldValue('phoneNumber', value)
              form.validateFields(['phoneNumber'])
            }}
            onTop={false}
          />}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          children={<TextArea rows={3} />}
          rules={[
            { max: 255 }
          ]}
        />
        <Form.Item
          name='groupId'
          label={$t({ defaultMessage: 'Identity Group' })}
          rules={[
            { required: true }
          ]}
          children={
            <PersonaGroupSelect
              disabled={!!defaultGroupId}
            />
          }
        />
        <Form.Item
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
      </GridCol>
    </GridRow>
  )
}
