import { useState } from 'react'

import { Form, FormInstance, Input, Select } from 'antd'
import { useIntl }                           from 'react-intl'

import { Button, showToast }                              from '@acx-ui/components'
import { useWebhookSendSampleEventMutation }              from '@acx-ui/rc/services'
import { URLProtocolRegExp, Webhook, WebhookPayloadEnum } from '@acx-ui/rc/utils'

import * as UI                         from './styledComponents'
import { getWebhookPayloadEnumString } from './webhookConfig'

interface SettingsTabProps {
  form: FormInstance<Webhook>
  isEditMode?: boolean
}

const SettingsTab = (props: SettingsTabProps) => {
  const { $t } = useIntl()
  const { form, isEditMode = false } = props
  const [testURLEnabled, setTestURLEnabled] = useState(isEditMode)
  const [sendSampleEvent] = useWebhookSendSampleEventMutation()


  const updateButtonEnabled = async (field: string) => {
    try {
      await form.validateFields([field])
      const enabled = form.getFieldValue(['url']) &&
        form.getFieldValue(['secret']) &&
        form.getFieldValue(['payload']) &&
        !form.getFieldsError(['url','secret','payload']).some(({ errors }) => errors.length)
      setTestURLEnabled(enabled)
    }
    catch {
      setTestURLEnabled(false)
    }
  }

  const testWebhook = async () => {
    try {
      const payloadValue = Object.keys(WebhookPayloadEnum)[Object.values(WebhookPayloadEnum)
        .indexOf(form.getFieldValue('payload') as WebhookPayloadEnum)]
      await sendSampleEvent({
        payload: {
          url: form.getFieldValue('url'),
          secret: form.getFieldValue('secret'),
          payload: payloadValue
        }
      }).unwrap()
      showToast({
        type: 'success',
        content: $t({ defaultMessage: 'Webhook sample event was sent successfully' })
      })
    }
    catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'Webhook error message' })
      })
    }
  }

  return <><Form.Item
    validateFirst
    name='name'
    label={$t({ defaultMessage: 'Name' })}
    rules={[
      { required: true },
      { max: 255 },
      { whitespace: true }
    ]}
    children={<Input />}
  />
  <UI.WebhookURLSpaceWrapper direction='horizontal'>
    <Form.Item
      validateFirst
      name='url'
      label={$t({ defaultMessage: 'Webhook URL' })}
      rules={[
        { required: true },
        { validator: (_, value) => URLProtocolRegExp(value) }
      ]}
      children={<Input type='url' onChange={() => updateButtonEnabled('url')} />}
    />
    <Button
      type='default'
      disabled={!testURLEnabled}
      onClick={testWebhook}>
      {$t({ defaultMessage: 'Test' })}
    </Button>
  </UI.WebhookURLSpaceWrapper>
  <Form.Item
    name='secret'
    label={$t({ defaultMessage: 'Secret' })}
    rules={[{ required: true }]}
    children={<Input.Password onChange={() => updateButtonEnabled('secret')} />}
  />
  <Form.Item
    name='payload'
    label={$t({ defaultMessage: 'Payload' })}
    rules={[{ required: true }]}
    children={<Select onChange={() => updateButtonEnabled('payload')}>
      {Object.values(WebhookPayloadEnum).map((value) =>
        (<Select.Option value={value}
          key={value}
          children={getWebhookPayloadEnumString($t, value as WebhookPayloadEnum)}/>)
      )}
    </Select>}
  />
  </>
}

export default SettingsTab
