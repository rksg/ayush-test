import { useCallback, useEffect, useState } from 'react'

import { FetchBaseQueryError }                                                          from '@reduxjs/toolkit/query'
import { Checkbox, Form, FormInstance, FormProps, Input, Select, Switch, TreeDataNode } from 'antd'
import _                                                                                from 'lodash'
import { useIntl }                                                                      from 'react-intl'

import type { Webhook, WebhookDto } from '@acx-ui/analytics/components'
import {
  useCreateWebhookMutation,
  useResourceGroups,
  useUpdateWebhookMutation,
  useSendSampleMutation,
  webhookDtoKeys
} from '@acx-ui/analytics/components'
import { handleError }        from '@acx-ui/analytics/components'
import { incidentSeverities } from '@acx-ui/analytics/utils'
import {
  Button,
  DisabledButton,
  Drawer,
  DrawerProps,
  Loader,
  showActionModal,
  showToast,
  Tabs,
  Subtitle
} from '@acx-ui/components'
import { get }               from '@acx-ui/config'
import { URLProtocolRegExp } from '@acx-ui/rc/utils'

import SettingsTab    from './SettingsTab'
import * as UI        from './styledComponents'
import WebhookFormTab from './WebhookFormTab'

import type { CheckboxGroupProps } from 'antd/es/checkbox'
import type { DefaultOptionType }  from 'antd/lib/select'

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

const incidentsTree: TreeDataNode[] = [
  {
    key: 'i-0',
    title: 'Severity',
    children: [
      {
        key: 'i-0-0',
        title: 'P1'
      },
      {
        key: 'i-0-1',
        title: 'P2'
      },
      {
        key: 'i-0-2',
        title: 'P3'
      },
      {
        key: 'i-0-3',
        title: 'P4'
      }
    ]
  }
]
const activitiesTree: TreeDataNode[] = [
  {
    key: 'a-0',
    title: 'Products',
    children: [
      {
        key: 'a-0-0',
        title: 'General'
      },
      {
        key: 'a-0-1',
        title: 'Wi-Fi'
      },
      {
        key: 'a-0-2',
        title: 'Switch'
      },
      {
        key: 'a-0-3',
        title: 'RUCKUS Edge'
      }
    ]
  }
]
const eventsTree: TreeDataNode[] = [
  {
    key: 'e-0',
    title: 'Severity',
    children: [
      {
        key: 'e-0-0',
        title: 'Critical'
      },
      {
        key: 'e-0-1',
        title: 'Major'
      },
      {
        key: 'e-0-2',
        title: 'Minor'
      },
      {
        key: 'e-0-3',
        title: 'Warning'
      },
      {
        key: 'e-0-4',
        title: 'Informational'
      }
    ]
  },
  {
    key: '1',
    title: 'Event Types',
    children: [
      {
        key: '1-0',
        title: 'AP'
      },
      {
        key: '1-1',
        title: 'Security'
      },
      {
        key: '1-2',
        title: 'Client'
      },
      {
        key: '1-3',
        title: 'Switch'
      },
      {
        key: '1-4',
        title: 'Network'
      },
      {
        key: '1-5',
        title: 'RUCKUS Edge'
      },
      {
        key: '1-6',
        title: 'Profile'
      }
    ]
  },
  {
    key: '2',
    title: 'Products',
    children: [
      {
        key: '2-0',
        title: 'General'
      },
      {
        key: '2-1',
        title: 'Wi-Fi'
      },
      {
        key: '2-2',
        title: 'Switch'
      },
      {
        key: '2-3',
        title: 'RUCKUS Edge'
      }
    ]
  }
]
const adminLogsTree: TreeDataNode[] = [
  {
    key: 'al-0',
    title: 'Event Types',
    children: [
      {
        key: 'al-0-0',
        title: 'AP'
      },
      {
        key: 'al-0-1',
        title: 'Security'
      },
      {
        key: 'al-0-2',
        title: 'Client'
      },
      {
        key: 'al-0-3',
        title: 'Switch'
      },
      {
        key: 'al-0-4',
        title: 'Network'
      },
      {
        key: 'al-0-5',
        title: 'RUCKUS Edge'
      },
      {
        key: 'al-0-6',
        title: 'Profile'
      }
    ]
  }
]

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
  const rg = useResourceGroups()
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
  /*return <Drawer {...drawerProps}>
    <Loader states={[rg]}>
      <Form {...formProps}>
        <Form.Item
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
        <Form.Item
          validateFirst
          name='callbackUrl'
          label={$t({ defaultMessage: 'Webhook URL' })}
          rules={[
            { required: true },
            { validator: (_, value) => URLProtocolRegExp(value) }
          ]}
          children={<Input type='url' />}
        />
        <Form.Item
          name='secret'
          label={$t({ defaultMessage: 'Secret' })}
          rules={[{ required: true }]}
          children={<Input.Password />}
        />
        {get('IS_MLISA_SA') && <Form.Item
          name='resourceGroupId'
          label={$t({ defaultMessage: 'Resource Group' })}
          rules={[{ required: true }]}
          children={<Select
            showSearch
            filterOption={resourceGroupFilterOption}
            placeholder={$t({ defaultMessage: 'Select a Resource Group' })}
            children={rg.data?.map((item) => (
              <Select.Option key={item.id}
                value={item.id}
                label={item.name}
                children={item.name}
              />
            ))}
          />}
        />}
        <Form.Item
          name='eventTypes'
          label={$t({ defaultMessage: 'Event Types' })}
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please select at least 1 event type' })
          }]}
          children={<EventTypesInput />}
        />
        <Form.Item name='enabled' hidden children={<Input hidden />} />
        {webhook?.id &&<Form.Item name='id' hidden children={<Input hidden />} />}
        <Form.Item><SendSampleIncident /></Form.Item>
      </Form>
    </Loader>
  </Drawer>*/
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

function SendSampleIncident () {
  const { $t } = useIntl()
  const [sendSample, response] = useSendSampleMutation()
  const [secret, callbackUrl] = [
    Form.useWatch('secret'),
    Form.useWatch('callbackUrl')
  ]

  const onClick = useCallback(
    () => { sendSample({ secret, callbackUrl }) },
    [sendSample, secret, callbackUrl]
  )

  useEffect(() => {
    if (response.isSuccess) {
      const message = typeof response.data.data === 'string'
        ? response.data.data
        : JSON.stringify(response.data.data, null, 2)
      showActionModal({
        type: 'info',
        title: $t({ defaultMessage: 'Sample Incident Sent' }),
        customContent: {
          action: 'CODE',
          details: {
            expanded: true,
            label: $t({ defaultMessage: 'Details' }),
            code: $t(
              { defaultMessage: 'Status: {status}{newline}Response: {newline}{message}' },
              { ...response.data, message, newline: '\n' }
            )
          }
        }
      })
    }

    if (response.isError) {
      handleError(
        response.error as FetchBaseQueryError,
        $t({ defaultMessage: 'Failed to send sample incident' })
      )
    }

    // reset mutation response everytime submission ended
    const isEnded = response.isSuccess || response.isError
    if (isEnded) response.reset()
  }, [$t, response])

  const buttonText = $t({ defaultMessage: 'Send Sample Incident' })
  return (Boolean(secret && callbackUrl) === true)
    ? <Button
      onClick={onClick}
      disabled={response.isLoading}
      loading={response.isLoading}
      htmlType='button'
      type='default'
      size='small'
      children={response.isLoading
        ? $t({ defaultMessage: 'Sending Sample Incident' })
        : buttonText
      }
    />
    : <DisabledButton
      title={$t({ defaultMessage: 'Please fill in Webhook URL and Secret' })}
      size='small'
      children={buttonText}
    />
}

function EventTypesInput (props: CheckboxGroupProps) {
  const { $t } = useIntl()
  const [value, setValue] = useState([] as string[][])

  useEffect(() => {
    const filtered = severities
      .filter(({ value }) => value.every(v => props.value?.includes(v)))
      .map(({ value }) => value)
    setValue(filtered)
  }, [props.value])

  const onChange: CheckboxGroupProps['onChange'] = (values) => {
    setValue(values as unknown as string[][])

    props.onChange?.(values.flat())
  }

  return <Checkbox.Group {...props} {...{ onChange, value: value as unknown as string[] }}>
    {severities.map(({ key, value }) => (<div key={key}>
      <Checkbox
        value={value}
        children={$t({ defaultMessage: '{severity} Incidents' }, { severity: key })}
      />
    </div>))}
  </Checkbox.Group>
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
