import { useState } from 'react'

import { Form, FormInstance, Input, Select } from 'antd'
import { useIntl }                           from 'react-intl'

import { Button, showToast }                      from '@acx-ui/components'
import { useWebhookSendSampleEventMutation }      from '@acx-ui/rc/services'
import { URLRegExp, Webhook, WebhookPayloadEnum } from '@acx-ui/rc/utils'

import * as UI                         from './styledComponents'
import { getWebhookPayloadEnumString } from './webhookConfig'

interface SettingsTabProps {
  form: FormInstance<Webhook>
  webhookData?: Webhook[]
  selected?: Webhook
}

const SettingsTab = (props: SettingsTabProps) => {
  const { $t } = useIntl()
  const { form, webhookData, selected } = props
  const isEditMode = selected ? true : false
  const [testURLEnabled, setTestURLEnabled] = useState(isEditMode)
  const [sendSampleEvent] = useWebhookSendSampleEventMutation()


  const updateButtonEnabled = async (field: string) => {
    try {
      await form.validateFields([field])
      const url = form.getFieldValue(['url'])
      const payload = form.getFieldValue(['payload'])
      const enabled = url && payload &&
        !form.getFieldsError(['url','payload']).some(({ errors }) => errors.length)
      setTestURLEnabled(enabled)
    }
    catch(error) {
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

  const payloadOptions = () => {
    return <Select onChange={() => updateButtonEnabled('payload')}>
      {Object.values(WebhookPayloadEnum).map((value) =>
        (<Select.Option value={value}
          key={value}
          children={getWebhookPayloadEnumString($t, value as WebhookPayloadEnum)}/>)
      )}
    </Select>
  }

  return <><Form.Item
    validateFirst
    name='name'
    label={$t({ defaultMessage: 'Name' })}
    rules={[
      { required: true },
      { max: 255 },
      { whitespace: true },
      { validator: (_, value) => {
        if(webhookData?.map((item) => { return item.name}).includes(value)
          && value !== selected?.name) {
          return Promise.reject(
            `${$t({ defaultMessage: 'Name already exists' })} `
          )
        }
        return Promise.resolve()}
      }
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
        { validator: (_, value) => {
          if(webhookData?.map((item) => { return item.url}).includes(value)
            && value !== selected?.url) {
            return Promise.reject(
              `${$t({ defaultMessage: 'Webhook URL already exists' })} `
            )
          }
          return Promise.resolve()}
        },
        { validator: (_, value) => URLRegExp(value) }
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
    children={<Input.Password onChange={() => updateButtonEnabled('secret')} />}
  />
  <Form.Item
    name='payload'
    label={$t({ defaultMessage: 'Payload' })}
    rules={[{ required: true }]}
    children={payloadOptions()}
  />
  </>
}

export default SettingsTab
