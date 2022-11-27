import { getIntl } from '@acx-ui/utils'

export const ClientTroubleShootingConfig = {
  selection: [
    {
      selectionType: 'category',
      defaultValue: [],
      placeHolder: getIntl().$t({ defaultMessage: 'All Categories' }),
      options: [
        {
          value: 'connection',
          label: getIntl().$t({ defaultMessage: 'Client Connection' })
        },
        {
          value: 'performance',
          label: getIntl().$t({ defaultMessage: 'Performance' })
        },
        {
          value: 'Infrastructure',
          label: getIntl().$t({ defaultMessage: 'Infrastructure' })
        }
      ]
    },
    {
      selectionType: 'type',
      defaultValue: [],
      placeHolder: getIntl().$t({ defaultMessage: 'All Types' }),
      options: [
        {
          value: 'info-updated',
          label: getIntl().$t({ defaultMessage: 'Client associated' })
        },
        {
          value: 'roamed',
          label: getIntl().$t({ defaultMessage: 'Client roamed' })
        },
        {
          value: 'disconnected',
          label: getIntl().$t({ defaultMessage: 'Client disconnected' })
        },
        {
          value: 'failure',
          label: getIntl().$t({ defaultMessage: 'Connection failure' })
        },
        {
          value: 'incident',
          label: getIntl().$t({ defaultMessage: 'Incident' })
        }
      ]
    },
    {
      selectionType: 'radio',
      defaultValue: [],
      placeHolder: getIntl().$t({ defaultMessage: 'All Radios' }),
      options: [
        {
          value: '2.4',
          label: getIntl().$t({ defaultMessage: '2.4 GHz' })
        },
        {
          value: '5',
          label: getIntl().$t({ defaultMessage: '5 GHz' })
        },
        {
          value: '6(5)',
          label: getIntl().$t({ defaultMessage: '6 GHz' })
        }
      ]
    } ],
  timeLine: [
    { title: getIntl().$t({ defaultMessage: 'Connection Events' }) },
    { title: getIntl().$t({ defaultMessage: 'Roaming' }) },
    { title: getIntl().$t({ defaultMessage: 'Connection Quality' }) },
    { title: getIntl().$t({ defaultMessage: 'Network Incidents' }) }
  ]
}