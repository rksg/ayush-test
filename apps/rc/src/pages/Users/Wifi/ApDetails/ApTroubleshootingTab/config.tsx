import { defineMessage } from 'react-intl'

export const ClientTroubleShootingConfig = {
  selection: [
    {
      selectionType: 'category',
      defaultValue: [],
      placeHolder: defineMessage({ defaultMessage: 'All Categories' }),
      options: [
        {
          value: 'connection',
          label: defineMessage({ defaultMessage: 'Client Connection' })
        },
        {
          value: 'performance',
          label: defineMessage({ defaultMessage: 'Performance' })
        },
        {
          value: 'Infrastructure',
          label: defineMessage({ defaultMessage: 'Infrastructure' })
        }
      ]
    },
    {
      selectionType: 'type',
      defaultValue: [],
      placeHolder: defineMessage({ defaultMessage: 'All Types' }),
      options: [
        {
          value: 'info-updated',
          label: defineMessage({ defaultMessage: 'Client associated' })
        },
        {
          value: 'roamed',
          label: defineMessage({ defaultMessage: 'Client roamed' })
        },
        {
          value: 'disconnected',
          label: defineMessage({ defaultMessage: 'Client disconnected' })
        },
        {
          value: 'failure',
          label: defineMessage({ defaultMessage: 'Connection failure' })
        },
        {
          value: 'incident',
          label: defineMessage({ defaultMessage: 'Incident' })
        }
      ]
    },
    {
      selectionType: 'radio',
      defaultValue: [],
      placeHolder: defineMessage({ defaultMessage: 'All Radios' }),
      options: [
        {
          value: '2.4',
          label: defineMessage({ defaultMessage: '2.4 GHz' })
        },
        {
          value: '5',
          label: defineMessage({ defaultMessage: '5 GHz' })
        },
        {
          value: '6(5)',
          label: defineMessage({ defaultMessage: '6 GHz' })
        }
      ]
    } ],
  timeLine: [
    { title: defineMessage({ defaultMessage: 'Connection Events' }) },
    { title: defineMessage({ defaultMessage: 'Roaming' }) },
    { title: defineMessage({ defaultMessage: 'Connection Quality' }) },
    { title: defineMessage({ defaultMessage: 'Network Incidents' }) }
  ]
}