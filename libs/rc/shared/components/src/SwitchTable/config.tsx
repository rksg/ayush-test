import { defineMessage, IntlShape } from 'react-intl'

import { SwitchRow } from '@acx-ui/rc/utils'
import { getIntl }   from '@acx-ui/utils'

import { SwitchStatus } from '.'

const commonAttributes = ($t: IntlShape['$t']) => [
  {
    key: 'members',
    renderer: (record: SwitchRow) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Members' }))}: {record.members}
      </div>
    )
  },
  {
    key: 'incidents',
    renderer: (record: SwitchRow) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Incidents (24 hours)' }))}: {record.incidents}
      </div>
    )
  },
  {
    key: 'clients',
    renderer: (record: SwitchRow) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Connected Clients' }))}: {record.clients}
      </div>
    )
  }
]

export const getGroupableConfig = () => {
  const { $t } = getIntl()
  const deviceStatusGroupableOptions = {
    key: 'deviceStatus',
    label: 'Status',
    attributes: [
      {
        key: 'deviceStatus',
        renderer: (record: SwitchRow) => (
          <SwitchStatus row={record} />
        )
      },
      ...commonAttributes($t)
    ]
  }
  const modelGroupableOptions = {
    key: 'model',
    label: 'Model',
    attributes: [
      {
        key: 'model',
        renderer: (record: SwitchRow) => <div style={{ fontStyle: 'bold' }}>
          {record.model && record.model.toLocaleUpperCase()}
        </div>
      },
      ...commonAttributes($t)
    ]
  }

  return { deviceStatusGroupableOptions, modelGroupableOptions }
}
