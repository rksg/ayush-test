import { getIntl } from '@acx-ui/utils'

export const ClientTroubleShootingConfig = {
  selection: [
    {
      selectionType: 'category',
      defaultValue: [],
      placeHolder: getIntl().$t({ defaultMessage: 'All Categories' }),
      options: [
        {
          value: 'clientConnection',
          label: 'Client Connection'
        },
        {
          value: 'performance',
          label: 'Performance'
        },
        {
          value: 'infrastructure',
          label: 'Infrastructure'
        }
      ]
    },
    {
      selectionType: 'type',
      defaultValue: [],
      placeHolder: getIntl().$t({ defaultMessage: 'All Types' }),
      options: [
        {
          value: 'clientAssociated',
          label: 'Client associated'
        },
        {
          value: 'clientRoamed',
          label: 'Client roamed'
        },
        {
          value: 'clientDisconnected',
          label: 'Client disconnected'
        },
        {
          value: 'connectionFailure',
          label: 'Connection failure'
        },
        {
          value: 'incident',
          label: 'Incident'
        }
      ]
    },
    {
      selectionType: 'radio',
      defaultValue: [],
      placeHolder: getIntl().$t({ defaultMessage: 'All Radios' }),
      options: [
        {
          value: '24ghz',
          label: '2.4 GHz'
        },
        {
          value: '5ghz',
          label: '5 GHz'
        },
        {
          value: '5ghz',
          label: '6 GHz'
        }
      ]
    } ]

}