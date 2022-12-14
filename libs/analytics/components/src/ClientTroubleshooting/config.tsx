import { defineMessage } from 'react-intl'

import { categoryOptions } from '@acx-ui/analytics/utils'

export const ClientTroubleShootingConfig = {
  selection: [
    {
      entityName: {
        singular: defineMessage({ defaultMessage: 'category' }),
        plural: defineMessage({ defaultMessage: 'categories' })
      },
      selectionType: 'category',
      defaultValue: [],
      placeHolder: defineMessage({ defaultMessage: 'All Categories' }),
      options: categoryOptions
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
      entityName: {
        singular: defineMessage({ defaultMessage: 'radio' }),
        plural: defineMessage({ defaultMessage: 'radios' })
      },
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