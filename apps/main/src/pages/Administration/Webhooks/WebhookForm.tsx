import { useCallback, useEffect, useState } from 'react'

import { FetchBaseQueryError }                   from '@reduxjs/toolkit/query'
import { Form, FormInstance, FormProps, Switch } from 'antd'
import _                                         from 'lodash'
import { useIntl }                               from 'react-intl'

import type { Webhook, WebhookDto } from '@acx-ui/analytics/components'
import {
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  webhookDtoKeys
} from '@acx-ui/analytics/components'
import { handleError }        from '@acx-ui/analytics/components'
import { incidentSeverities } from '@acx-ui/analytics/utils'
import {
  Drawer,
  DrawerProps,
  showToast,
  Tabs
} from '@acx-ui/components'

import SettingsTab                                                  from './SettingsTab'
import * as UI                                                      from './styledComponents'
import { activitiesTree, adminLogsTree, eventsTree, incidentsTree } from './webhookConfig'
import WebhookFormTab                                               from './WebhookFormTab'

import type { DefaultOptionType } from 'antd/lib/select'

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

export function WebhookForm (props: {
  webhook?: Webhook | null
  onClose: () => void
}) {
  const { submit, response } = useWebhookMutation(props.webhook)
  const webhook = props.webhook || initialValues
  const { $t } = useIntl()
  const [form] = Form.useForm<WebhookDto>()
  const [currentTab, setCurrentTab] = useState('settings')

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
          ? $t({ defaultMessage: 'Webhook was updated' })
          : $t({ defaultMessage: 'Webhook was created' })
      })
    }

    if (response.isError) {
      handleError(
        response.error as FetchBaseQueryError,
        webhook?.id
          ? $t({ defaultMessage: 'Failed to update webhook' })
          : $t({ defaultMessage: 'Failed to create webhook' })
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

  const tabs = [
    {
      key: 'settings',
      title: $t({ defaultMessage: 'Settings' }),
      component: <SettingsTab />
    },
    {
      key: 'incidents',
      title: $t({ defaultMessage: 'Incidents' }),
      component: <WebhookFormTab
        treeData={incidentsTree}
        checked={form.getFieldValue('incidents')}
        updateChecked={(checked) => form.setFieldValue('incidents', checked)}
      />
    },
    {
      key: 'activities',
      title: $t({ defaultMessage: 'Activities' }),
      component: <WebhookFormTab
        treeData={activitiesTree}
        checked={form.getFieldValue('activities')}
        updateChecked={(checked) => form.setFieldValue('activities', checked)}
      />
    },
    {
      key: 'events',
      title: $t({ defaultMessage: 'Events' }),
      component: <WebhookFormTab
        treeData={eventsTree}
        checked={form.getFieldValue('events')}
        updateChecked={(checked) => form.setFieldValue('events', checked)}
        multiColumn={true}
      />
    },
    {
      key: 'adminLogs',
      title: $t({ defaultMessage: 'Admin Logs' }),
      component: <WebhookFormTab
        treeData={adminLogsTree}
        checked={form.getFieldValue('adminLogs')}
        updateChecked={(checked) => form.setFieldValue('adminLogs', checked)}
        multiColumn={true}
      />
    }
  ]

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const ActiveTabPane = tabs.find(({ key }) => key === currentTab)?.component

  const drawerProps: DrawerProps = {
    destroyOnClose: true,
    visible: Boolean(props.webhook !== null),
    width: 450,
    title: webhook?.id
      ? $t({ defaultMessage: 'Edit Webhook' })
      : $t({ defaultMessage: 'Create Webhook' }),
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
    <UI.WebhookFormWrapper>
      <Form {...formProps}>
        <Tabs
          defaultActiveKey='settings'
          activeKey={currentTab}
          onChange={onTabChange}
        >
          {tabs.map(({ key, title }) =>
            <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
        {ActiveTabPane}
      </Form>
    </UI.WebhookFormWrapper>
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
