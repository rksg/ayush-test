import { TreeDataNode } from 'antd'
import { IntlShape }    from 'react-intl'

import { WebhookActivityEnum, WebhookEventEnum, WebhookIncidentEnum, WebhookPayloadEnum } from '@acx-ui/rc/utils'

export const getIncidentsTree = ($t: IntlShape['$t']) => {
  return [
    {
      key: 'incident-severity',
      title: $t({ defaultMessage: 'Severity' }),
      children: [
        {
          key: WebhookIncidentEnum.SEVERITY_P1,
          title: $t({ defaultMessage: 'P1' })
        },
        {
          key: WebhookIncidentEnum.SEVERITY_P2,
          title: $t({ defaultMessage: 'P2' })
        },
        {
          key: WebhookIncidentEnum.SEVERITY_P3,
          title: $t({ defaultMessage: 'P3' })
        },
        {
          key: WebhookIncidentEnum.SEVERITY_P4,
          title: $t({ defaultMessage: 'P4' })
        }
      ]
    } as TreeDataNode
  ]}
export const getActivitiesTree = ($t: IntlShape['$t']) => {
  return [
    {
      key: 'activity-product',
      title: $t({ defaultMessage: 'Products' }),
      children: [
        {
          key: WebhookActivityEnum.PRODUCT_GENERAL,
          title: $t({ defaultMessage: 'General' })
        },
        {
          key: WebhookActivityEnum.PRODUCT_WIFI,
          title: $t({ defaultMessage: 'Wi-Fi' })
        },
        {
          key: WebhookActivityEnum.PRODUCT_SWITCH,
          title: $t({ defaultMessage: 'Switch' })
        },
        {
          key: WebhookActivityEnum.PRODUCT_EDGE,
          title: $t({ defaultMessage: 'RUCKUS Edge' })
        }
      ]
    } as TreeDataNode
  ]}
export const getEventsTree = ($t: IntlShape['$t']) => {
  return [
    {
      key: 'event-severity',
      title: $t({ defaultMessage: 'Severity' }),
      children: [
        {
          key: WebhookEventEnum.SEVERITY_CRITICAL,
          title: $t({ defaultMessage: 'Critical' })
        },
        {
          key: WebhookEventEnum.SEVERITY_MAJOR,
          title: $t({ defaultMessage: 'Major' })
        },
        {
          key: WebhookEventEnum.SEVERITY_MINOR,
          title: $t({ defaultMessage: 'Minor' })
        },
        {
          key: WebhookEventEnum.SEVERITY_WARNING,
          title: $t({ defaultMessage: 'Warning' })
        },
        {
          key: WebhookEventEnum.SEVERITY_INFO,
          title: $t({ defaultMessage: 'Informational' })
        }
      ]
    } as TreeDataNode,
    {
      key: 'event-type',
      title: $t({ defaultMessage: 'Event Types' }),
      children: [
        {
          key: WebhookEventEnum.TYPE_AP,
          title: $t({ defaultMessage: 'AP' })
        },
        {
          key: WebhookEventEnum.TYPE_SECURITY,
          title: $t({ defaultMessage: 'Security' })
        },
        {
          key: WebhookEventEnum.TYPE_CLIENT,
          title: $t({ defaultMessage: 'Client' })
        },
        {
          key: WebhookEventEnum.TYPE_SWITCH,
          title: $t({ defaultMessage: 'Switch' })
        },
        {
          key: WebhookEventEnum.TYPE_ADMIN,
          title: $t({ defaultMessage: 'Admin' })
        },
        {
          key: WebhookEventEnum.TYPE_NETWORK,
          title: $t({ defaultMessage: 'Network' })
        },
        {
          key: WebhookEventEnum.TYPE_EDGE,
          title: $t({ defaultMessage: 'RUCKUS Edge' })
        },
        {
          key: WebhookEventEnum.TYPE_PROFILE,
          title: $t({ defaultMessage: 'Profile' })
        }
      ]
    } as TreeDataNode,
    {
      key: 'event-product',
      title: $t({ defaultMessage: 'Products' }),
      children: [
        {
          key: WebhookEventEnum.PRODUCT_GENERAL,
          title: $t({ defaultMessage: 'General' })
        },
        {
          key: WebhookEventEnum.PRODUCT_WIFI,
          title: $t({ defaultMessage: 'Wi-Fi' })
        },
        {
          key: WebhookEventEnum.PRODUCT_SWITCH,
          title: $t({ defaultMessage: 'Switch' })
        },
        {
          key: WebhookEventEnum.PRODUCT_EDGE,
          title: $t({ defaultMessage: 'RUCKUS Edge' })
        }
      ]
    } as TreeDataNode
  ]}
export const getWebhookPayloadEnumString = ($t: IntlShape['$t'], payload: WebhookPayloadEnum) => {
  switch (payload) {
    case WebhookPayloadEnum.RUCKUS:
      return $t({ defaultMessage: 'RUCKUS One' })
    case WebhookPayloadEnum.DATADOG:
      return $t({ defaultMessage: 'DataDog' })
    case WebhookPayloadEnum.MICROSOFT_TEAM:
      return $t({ defaultMessage: 'Microsoft Teams' })
    case WebhookPayloadEnum.PAGERDUTY:
      return $t({ defaultMessage: 'PagerDuty' })
    case WebhookPayloadEnum.SERVICE_NOW:
      return $t({ defaultMessage: 'ServiceNow' })
    case WebhookPayloadEnum.SLACK:
      return $t({ defaultMessage: 'Slack' })
    case WebhookPayloadEnum.SPLUNK:
      return $t({ defaultMessage: 'Splunk' })
    default:
      return ''
  }
}