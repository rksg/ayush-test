import { defineMessage, MessageDescriptor } from 'react-intl'

import { categoryOptions }        from '@acx-ui/analytics/utils'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { hasRaiPermission }       from '@acx-ui/user'

import { BTM_REQUEST, BTM_RESPONSE, DISCONNECT, DISCONNECTED, FAILURE, INCIDENT, INFO_UPDATED, IsVisibleType, RADIO2DOT4G, RADIO5G, RADIO65G, ROAMED, SLOW, SUCCESS, TimelineItem, TYPES } from './config'

interface ClientTroubleShootingConfigType {
  selection: Array<{
    entityName: {
      singular: MessageDescriptor
      plural: MessageDescriptor
    }
    selectionType: 'category' | 'type' | 'radio'
    defaultValue: []
    placeHolder: MessageDescriptor
    options: Array<{
      value: string
      label: MessageDescriptor
      isVisible: IsVisibleType
    }>
    isVisible: IsVisibleType
  }>
  timeline: TimelineItem[]
}


const useClientTroubleshootingConfig =() => {
  const isBtmEventsOn = [
    useIsSplitOn(Features.BTM_EVENTS_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_BTM_EVENTS_TOGGLE)
  ].some(Boolean)

  const clientTroubleshootingConfigType: ClientTroubleShootingConfigType = {
    selection: [
      {
        entityName: {
          singular: defineMessage({ defaultMessage: 'category' }),
          plural: defineMessage({ defaultMessage: 'categories' })
        },
        selectionType: 'category',
        defaultValue: [],
        placeHolder: defineMessage({ defaultMessage: 'All Categories' }),
        options: categoryOptions,
        isVisible: () => hasRaiPermission('READ_INCIDENTS')
      },
      {
        entityName: {
          singular: defineMessage({ defaultMessage: 'type' }),
          plural: defineMessage({ defaultMessage: 'types' })
        },
        selectionType: 'type',
        defaultValue: [],
        placeHolder: defineMessage({ defaultMessage: 'All Types' }),
        options: [
          {
            value: INFO_UPDATED,
            label: defineMessage({ defaultMessage: 'Client associated' }),
            isVisible: () => true
          },
          {
            value: ROAMED,
            label: defineMessage({ defaultMessage: 'Client roamed' }),
            isVisible: () => true
          },
          {
            value: DISCONNECTED,
            label: defineMessage({ defaultMessage: 'Client disconnected' }),
            isVisible: () => true
          },
          {
            value: FAILURE,
            label: defineMessage({ defaultMessage: 'Connection failure' }),
            isVisible: () => true
          },
          {
            value: INCIDENT,
            label: defineMessage({ defaultMessage: 'Incident' }),
            isVisible: () => hasRaiPermission('READ_INCIDENTS')
          },
          {
            value: BTM_REQUEST,
            label: defineMessage({ defaultMessage: 'BTM request' }),
            isVisible: () => isBtmEventsOn
          },
          {
            value: BTM_RESPONSE,
            label: defineMessage({ defaultMessage: 'BTM response' }),
            isVisible: () => isBtmEventsOn
          }
        ],
        isVisible: () => true
      },
      {
        entityName: {
          singular: defineMessage({ defaultMessage: 'radio' }),
          plural: defineMessage({ defaultMessage: 'radios' })
        },
        selectionType: 'radio',
        defaultValue: [],
        placeHolder: defineMessage({ defaultMessage: 'All Radios' }),
        options: [
          {
            value: RADIO2DOT4G,
            label: defineMessage({ defaultMessage: '2.4 GHz' }),
            isVisible: () => true
          },
          {
            value: RADIO5G,
            label: defineMessage({ defaultMessage: '5 GHz' }),
            isVisible: () => true
          },
          {
            value: RADIO65G,
            label: defineMessage({ defaultMessage: '6 GHz' }),
            isVisible: () => true
          }
        ],
        isVisible: () => true
      }
    ],
    timeline: [
      {
        title: defineMessage({ defaultMessage: 'Connection Events' }),
        value: TYPES.CONNECTION_EVENTS,
        showCount: true,
        chartMapping: [
          {
            key: 'all',
            label: 'all',
            chartType: 'scatter',
            series: 'events',
            isVisible: () => true
          },
          {
            key: 'success',
            label: 'success',
            chartType: 'scatter',
            series: 'events',
            isVisible: () => true
          },
          {
            key: 'failure',
            label: 'failure',
            chartType: 'scatter',
            series: 'events',
            isVisible: () => true
          },
          {
            key: 'slow',
            label: 'slow',
            chartType: 'scatter',
            series: 'events',
            isVisible: () => true
          },
          {
            key: 'disconnect',
            label: 'disconnect',
            chartType: 'scatter',
            series: 'events',
            isVisible: () => true
          },
          {
            key: 'btm-request',
            label: 'btm request',
            chartType: 'scatter',
            series: 'events',
            isVisible: () => isBtmEventsOn
          },
          {
            key: 'btm-response',
            label: 'btm response',
            chartType: 'scatter',
            series: 'events',
            isVisible: () => isBtmEventsOn
          }
        ],
        showResetZoom: true,
        subtitle: [
          {
            title: defineMessage({ defaultMessage: 'Success' }),
            value: SUCCESS,
            isVisible: () => true
          },
          {
            title: defineMessage({ defaultMessage: 'Failure' }),
            value: FAILURE,
            isVisible: () => true
          },
          {
            title: defineMessage({ defaultMessage: 'Slow' }),
            value: SLOW,
            isVisible: () => true
          },
          {
            title: defineMessage({ defaultMessage: 'Disconnect' }),
            value: DISCONNECT,
            isVisible: () => true
          },
          {
            title: defineMessage({ defaultMessage: 'BTM Request' }),
            value: BTM_REQUEST,
            isVisible: () => isBtmEventsOn
          },
          {
            title: defineMessage({ defaultMessage: 'BTM Response' }),
            value: BTM_RESPONSE,
            isVisible: () => isBtmEventsOn
          }
        ],
        isVisible: () => true
      },
      {
        title: defineMessage({ defaultMessage: 'Roaming' }), //hide
        value: TYPES.ROAMING,
        showCount: true,
        chartMapping: [
          {
            key: 'all',
            label: 'all',
            chartType: 'scatter',
            series: 'roaming',
            isVisible: () => true
          }
        ],
        isVisible: () => true
      },
      {
        title: defineMessage({ defaultMessage: 'Connection Quality' }),
        value: TYPES.CONNECTION_QUALITY,
        showCount: false,
        chartMapping: [
          { key: 'all', label: 'all', chartType: 'bar', series: 'quality', isVisible: () => true },
          { key: 'rss', label: 'rss', chartType: 'bar', series: 'quality', isVisible: () => true },
          { key: 'snr', label: 'snr', chartType: 'bar', series: 'quality', isVisible: () => true },
          {
            key: 'throughput',
            label: 'throughput',
            chartType: 'bar',
            series: 'quality',
            isVisible: () => true
          },
          {
            key: 'avgTxMCS',
            label: 'avgTxMCS',
            chartType: 'bar',
            series: 'quality',
            isVisible: () => true
          }
        ],
        subtitle: [
          {
            title: defineMessage({ defaultMessage: 'RSS' }),
            value: 'RSS',
            isVisible: () => true
          },
          {
            title: defineMessage({ defaultMessage: 'SNR' }),
            value: 'SNR',
            isVisible: () => true
          },
          {
            title: defineMessage({ defaultMessage: 'Client Throughput' }),
            value: 'clientThroughput',
            isVisible: () => true
          },
          {
            title: defineMessage({ defaultMessage: 'Avg. MCS(Downlink)' }),
            value: 'AvgMCS',
            isVisible: () => true
          }
        ],
        isVisible: () => true
      },
      {
        title: defineMessage({ defaultMessage: 'Network Incidents' }),
        value: TYPES.NETWORK_INCIDENTS,
        showCount: true,
        hasXaxisLabel: true,
        chartMapping: [
          {
            key: 'all',
            label: 'all',
            chartType: 'bar',
            series: 'incidents',
            isVisible: () => true
          },
          {
            key: 'connection',
            label: 'connection',
            chartType: 'bar',
            series: 'incidents',
            isVisible: () => true
          },
          {
            key: 'performance',
            label: 'performance',
            chartType: 'bar',
            series: 'incidents',
            isVisible: () => true
          },
          {
            key: 'infrastructure',
            label: 'infrastructure',
            chartType: 'bar',
            series: 'incidents',
            isVisible: () => true
          }
        ],
        subtitle: [
          {
            title: defineMessage({ defaultMessage: 'Client Connection' }),
            value: 'connection',
            isVisible: () => true
          },
          {
            title: defineMessage({ defaultMessage: 'Performance' }),
            value: 'performance',
            isVisible: () => true
          },
          {
            title: defineMessage({ defaultMessage: 'Infrastructure' }),
            value: 'infrastructure',
            isVisible: () => true
          }
        ],
        isVisible: () => hasRaiPermission('READ_INCIDENTS')
      }
    ]
  }

  return { clientTroubleshootingConfigType, isBtmEventsOn }
}

export default useClientTroubleshootingConfig
