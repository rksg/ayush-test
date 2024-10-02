import { useCallback, useEffect, useState } from 'react'

import { FetchBaseQueryError }                          from '@reduxjs/toolkit/query'
import { Form, FormInstance, FormProps, Input, Switch } from 'antd'
import _                                                from 'lodash'
import { useIntl }                                      from 'react-intl'

import { incidentSeverities } from '@acx-ui/analytics/utils'
import {
  Drawer,
  DrawerProps,
  Loader,
  showToast
} from '@acx-ui/components'

import {
  useCreateWebhookMutation,
  useResourceGroups,
  useUpdateWebhookMutation,
  webhookDtoKeys,
  handleError
} from './services'

import type { Webhook, WebhookDto } from './services'
import type { DefaultOptionType }   from 'antd/lib/select'

const severities = Object.keys(incidentSeverities).map(key => ({
  key,
  value: [
    `incident_create_${key.toLowerCase()}`,
    `incident_update_${key.toLowerCase()}`
  ]
}))

const initialValues = {
  enabled: true,
  eventTypes: severities.flatMap(v => v.value)
} as Partial<Webhook> as Webhook

function useWebhookMutation (
  webhook?: Webhook | null
) {
  const [doCreate, createResponse] = useCreateWebhookMutation()
  const [doUpdate, updateResponse] = useUpdateWebhookMutation()

  return webhook
    ? { submit: doUpdate, response: updateResponse }
    : { submit: doCreate, response: createResponse }
}

export function ApplicationTokenForm (props: {
  webhook?: Webhook | null
  onClose: () => void
}) {
  const rg = useResourceGroups()
  const { submit, response } = useWebhookMutation(props.webhook)
  const webhook = props.webhook || initialValues
  const { $t } = useIntl()
  const [form] = Form.useForm<WebhookDto>()

  const onClose = useCallback(() => {
    form.resetFields()
    props.onClose()
  }, [form, props.onClose])

  // reset form fields every time user choose to edit/create record
  useEffect(() => { form.resetFields() }, [form, props.webhook?.id])

  useEffect(() => {
    if (response.isSuccess) {
      onClose()
      showToast({
        type: 'success',
        content: webhook?.id
          ? $t({ defaultMessage: 'Application Token was updated' })
          : $t({ defaultMessage: 'Application token was created' })
      })
    }

    if (response.isError) {
      handleError(
        response.error as FetchBaseQueryError,
        webhook?.id
          ? $t({ defaultMessage: 'Failed to update application token' })
          : $t({ defaultMessage: 'Failed to create application token' })
      )
    }

    // reset mutation response everytime submission ended
    const isEnded = response.isSuccess || response.isError
    if (isEnded) response.reset()
  }, [$t, onClose, response, webhook?.id])

  const formProps: FormProps<WebhookDto> = {
    layout: 'vertical',
    form,
    initialValues: _.pick(webhook, webhookDtoKeys) as Partial<WebhookDto>
  }

  const onSave = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      await submit(values).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const drawerProps: DrawerProps = {
    destroyOnClose: true,
    visible: Boolean(props.webhook !== null),
    width: 450,
    title: webhook?.id
      ? $t({ defaultMessage: 'Edit Application Token' })
      : $t({ defaultMessage: 'Create Application Token' }),
    onClose: onClose,
    footer: <Drawer.FormFooter
      extra={<WebhookSwitch key={`toggle-${webhook?.id}`} {...{ form, webhook }} />}
      buttonLabel={{ save: webhook?.id
        ? $t({ defaultMessage: 'Save' })
        : $t({ defaultMessage: 'Create' })
      }}
      onCancel={onClose}
      onSave={onSave}
    />
  }
  return <Drawer {...drawerProps}>
    <Loader states={[rg]}>
      <Form {...formProps}>
        <Form.Item
          validateFirst
          name='tokenName'
          label={$t({ defaultMessage: 'Token Name' })}
          rules={[
            { required: true },
            { max: 255 },
            { whitespace: true }
          ]}
          children={<Input />}
        />
        <Form.Item name='enabled' hidden children={<Input hidden />} />
        {webhook?.id &&<Form.Item name='id' hidden children={<Input hidden />} />}
      </Form>
    </Loader>
  </Drawer>
}

export const resourceGroupFilterOption = (input: string, option?: DefaultOptionType) => {
  return (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
}

function WebhookSwitch (props: { webhook?: Webhook, form: FormInstance<WebhookDto> }) {
  const { $t } = useIntl()
  const [enabled, setEnabled] = useState<boolean | undefined>(props.webhook?.enabled)

  return (<label>
    <Switch
      checked={enabled}
      onChange={(value) => {
        setEnabled(value)
        props.form.setFieldsValue({ enabled: value })
      }}
    />
    <span>{enabled ? $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })}</span>
  </label>)
}
