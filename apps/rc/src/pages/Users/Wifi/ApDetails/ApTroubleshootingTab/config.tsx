import { getIntl } from '@acx-ui/utils'

const { $t } = getIntl()

export const ClientTroubleShootingConfig = {
  selection: [
    {
      selectionType: 'category',
      defaultValue: [],
      placeHolder: $t({ defaultMessage: 'All Categories' }),
      options: [
        {
          value: 'connection',
          label: $t({ defaultMessage: 'Client Connection' })
        },
        {
          value: 'performance',
          label: $t({ defaultMessage: 'Performance' })
        },
        {
          value: 'Infrastructure',
          label: $t({ defaultMessage: 'Infrastructure' })
        }
      ]
    },
    {
      selectionType: 'type',
      defaultValue: [],
      placeHolder: $t({ defaultMessage: 'All Types' }),
      options: [
        {
          value: 'info-updated',
          label: $t({ defaultMessage: 'Client associated' })
        },
        {
          value: 'roamed',
          label: $t({ defaultMessage: 'Client roamed' })
        },
        {
          value: 'disconnected',
          label: $t({ defaultMessage: 'Client disconnected' })
        },
        {
          value: 'failure',
          label: $t({ defaultMessage: 'Connection failure' })
        },
        {
          value: 'incident',
          label: $t({ defaultMessage: 'Incident' })
        }
      ]
    },
    {
      selectionType: 'radio',
      defaultValue: [],
      placeHolder: $t({ defaultMessage: 'All Radios' }),
      options: [
        {
          value: '2.4',
          label: $t({ defaultMessage: '2.4 GHz' })
        },
        {
          value: '5',
          label: $t({ defaultMessage: '5 GHz' })
        },
        {
          value: '6(5)',
          label: $t({ defaultMessage: '6 GHz' })
        }
      ]
    } ],
  timeLine: [
    { title: $t({ defaultMessage: 'Connection Events' }) },
    { title: $t({ defaultMessage: 'Roaming' }) },
    { title: $t({ defaultMessage: 'Connection Quality' }) },
    { title: $t({ defaultMessage: 'Network Incidents' }) }
  ]
}