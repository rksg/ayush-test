import { Button }                   from 'antd'
import { defineMessage, IntlShape } from 'react-intl'

import { ApDeviceStatusEnum, APExtended } from '@acx-ui/rc/utils'
import { Params, TenantLink }             from '@acx-ui/react-router-dom'
import { getIntl }                        from '@acx-ui/utils'

import { SwitchStatus } from '.'

const commonAttributes = ($t: IntlShape['$t']) => [
  {
    key: 'members',
    renderer: (record: APExtended) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Members' }))}: {record.members}
      </div>
    )
  },
  {
    key: 'incidents',
    renderer: (record: APExtended) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Incidents (24 hours)' }))}: {record.incidents}
      </div>
    )
  },
  {
    key: 'clients',
    renderer: (record: APExtended) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Connected Clients' }))}: {record.clients}
      </div>
    )
  },
  {
    key: 'networks',
    renderer: (record: APExtended) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Wireless Networks' }))}:{' '}
        {record.networks ? record.networks.count : 0}
      </div>
    )
  }
]

export const getGroupableConfig = (
  params? :Readonly<Params<string>>,
  apAction?: {
    showDeleteApGroups: (record: APExtended, tenantId: string) => void
  } ) => {
  const { $t } = getIntl()
  const deviceStatusGroupableOptions = {
    key: 'deviceStatus',
    label: 'Status',
    attributes: [
      {
        key: 'deviceStatus',
        renderer: (record: any) => (
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
        renderer: (record: APExtended) => <div style={{ fontStyle: 'bold' }}>{record.model}</div>
      },
      ...commonAttributes($t)
    ]
  }

  return { deviceStatusGroupableOptions, modelGroupableOptions }
}

export const groupedFields = [
  'check-all',
  'name',
  'deviceStatus',
  'model',
  'meshRole',
  'IP',
  'apMac',
  'venueName',
  'switchName',
  'clients',
  'deviceGroupName',
  'apStatusData.APRadio.band',
  'tags',
  'serialNumber',
  'fwVersion',
  'cog',
  'venueId',
  'apStatusData.APRadio.radioId',
  'apStatusData.APRadio.channel'
]
