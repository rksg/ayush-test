import { useCallback, useEffect, useState } from 'react'

import { Form, FormProps, Switch } from 'antd'
import { useIntl }                 from 'react-intl'

import {
  Drawer,
  DrawerProps,
  Tabs
} from '@acx-ui/components'
import { useAddWebhookMutation, useUpdateWebhookMutation } from '@acx-ui/rc/services'
import {
  Webhook,
  WebhookActivityEnum,
  WebhookEventEnum,
  WebhookIncidentEnum,
  WebhookPayloadEnum
} from '@acx-ui/rc/utils'

import SettingsTab                                            from './SettingsTab'
import * as UI                                                from './styledComponents'
import { getEventsTree, getActivitiesTree, getIncidentsTree } from './webhookConfig'
import WebhookFormTab                                         from './WebhookFormTab'

const incidentProps = [ ...new Set(Object.keys(WebhookIncidentEnum).map(key =>
  key.slice(0, key.indexOf('_')))) ]

const activityProps = [ ...new Set(Object.keys(WebhookActivityEnum).map(key =>
  key.slice(0, key.indexOf('_')))) ]

const eventProps = [ ...new Set(Object.keys(WebhookEventEnum).map(key =>
  key.slice(0, key.indexOf('_')))) ]

export function WebhookForm (props: {
  visible: boolean
  setVisible: (visible: boolean) => void
  selected?: Webhook
  webhookData?: Webhook[]
}) {
  const { $t } = useIntl()
  const [form] = Form.useForm<Webhook>()
  const [currentTab, setCurrentTab] = useState('settings')
  const [settings, setSettings] = useState<Webhook>()
  const [incidents, setIncidents] = useState<string[]>([])
  const [activities, setActivities] = useState<string[]>([])
  const [events, setEvents] = useState<string[]>([])
  const [enabled, setEnabled] = useState<boolean>(true)
  const [touched, setTouched] = useState<boolean>(false)
  const webhook = props.selected ?? undefined
  const [addWebhook] = useAddWebhookMutation()
  const [updateWebhook] = useUpdateWebhookMutation()

  const setWebhookEditValues = (data: Webhook) => {
    setSettings({
      ...data,
      payload: WebhookPayloadEnum[data.payload as keyof typeof WebhookPayloadEnum]
    })
    const incidents = incidentProps.flatMap(prop => data.incident[prop.toLowerCase()]?.map(i =>
      WebhookIncidentEnum[(prop + '_' + i) as keyof typeof WebhookIncidentEnum]))
    const activities = activityProps.flatMap(prop => data.activity[prop.toLowerCase()]?.map(a =>
      WebhookActivityEnum[(prop + '_' + a) as keyof typeof WebhookActivityEnum]))
    const events = eventProps.flatMap(prop => data.event[prop.toLowerCase()]?.map(e =>
      WebhookEventEnum[(prop + '_' + e) as keyof typeof WebhookEventEnum]))
    setIncidents(incidents)
    setActivities(activities)
    setEvents(events)
    setEnabled(data.status === 'ON' ? true : false)
  }

  useEffect(() => {
    if (webhook) {
      setWebhookEditValues(webhook)
    }
  },[webhook])

  const onClose = useCallback(() => {
    form.resetFields()
    props.setVisible(false)
  }, [form, props.setVisible])

  // reset form fields every time user choose to edit/create record
  useEffect(() => { form.resetFields() }, [form, props.selected?.id, settings])

  const formProps: FormProps<Webhook> = {
    layout: 'vertical',
    form,
    initialValues: settings
  }

  const onSave = async () => {
    try {
      setTouched(true)
      const hasError = enabled &&
        incidents.length === 0 && activities.length === 0 && events.length === 0
      await form.validateFields()
      if (!hasError) {
        const values = form.getFieldsValue(['name','url','secret','payload'])
        const payload: Webhook = {
          ...values,
          payload: Object.keys(WebhookPayloadEnum)[Object.values(WebhookPayloadEnum)
            .indexOf(values.payload as WebhookPayloadEnum)],
          status: enabled ? 'ON' : 'OFF',
          incident: {},
          activity: {},
          event: {}
        }
        const incidentEnumKeys = incidents.map(value => value.slice(value.indexOf('_') + 1))
        const activityEnumKeys = activities.map(value => value.slice(value.indexOf('_') + 1))
        const eventEnumKeys = events.map(value => value.slice(value.indexOf('_') + 1))
        incidentProps.forEach(prop => {
          payload.incident[prop.toLowerCase()] = incidentEnumKeys
            .filter(key => key.split('_')[0] === prop).map(key => key.split('_')[1])
        })
        activityProps.forEach(prop => {
          payload.activity[prop.toLowerCase()] = activityEnumKeys
            .filter(key => key.split('_')[0] === prop).map(key => key.split('_')[1])
        })
        eventProps.forEach(prop => {
          payload.event[prop.toLowerCase()] = eventEnumKeys.filter(key =>
            key.split('_')[0] === prop).map(key => key.split('_')[1])
        })
        if (props.selected) {
          await updateWebhook({ params: { webhookId: props.selected.id },
            payload: payload }).unwrap()
        }
        else {
          await addWebhook({ payload: payload }).unwrap()
        }
        onClose()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const tabs = [
    {
      key: 'settings',
      title: $t({ defaultMessage: 'Settings' }),
      component: <SettingsTab
        form={form}
        webhookData={props.webhookData}
        selected={props.selected}
      />
    },
    {
      key: 'incidents',
      title: $t({ defaultMessage: 'Incidents' }),
      component: <WebhookFormTab
        treeData={getIncidentsTree($t)}
        checked={incidents}
        updateChecked={(checked) => setIncidents(checked as string[])}
      />
    },
    {
      key: 'activities',
      title: $t({ defaultMessage: 'Activities' }),
      component: <WebhookFormTab
        treeData={getActivitiesTree($t)}
        checked={activities}
        updateChecked={(checked) => setActivities(checked as string[])}
      />
    },
    {
      key: 'events',
      title: $t({ defaultMessage: 'Events' }),
      component: <WebhookFormTab
        treeData={getEventsTree($t)}
        checked={events}
        updateChecked={(checked) => setEvents(checked as string[])}
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
    visible: props.visible,
    width: 450,
    title: webhook
      ? $t({ defaultMessage: 'Edit Webhook' })
      : $t({ defaultMessage: 'Create Webhook' }),
    onClose: onClose,
    footer: <Drawer.FormFooter
      extra={<label>
        <Switch key={`toggle-${webhook?.id}`}
          checked={enabled}
          onChange={(value) => setEnabled(value)}
        />
        <span>{enabled ? $t({ defaultMessage: 'Enabled' })
          : $t({ defaultMessage: 'Disabled' })}</span>
      </label>}
      buttonLabel={{ save: webhook
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
        <div role='alert'
          className='ant-form-item-explain-error'
          style={{ position: 'absolute', bottom: '72px' }}
          hidden={!(touched && enabled &&
            incidents.length === 0 && activities.length === 0 && events.length === 0)}>
          {$t({ defaultMessage: 'Please select at least one Incident, Activity, or Event' })}
        </div>
      </Form>
    </UI.WebhookFormWrapper>
  </Drawer>
}