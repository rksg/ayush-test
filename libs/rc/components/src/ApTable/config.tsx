import { Button }                   from 'antd'
import { defineMessage, IntlShape } from 'react-intl'

import { ApDeviceStatusEnum, APExtended } from '@acx-ui/rc/utils'
import { Params, TenantLink }             from '@acx-ui/react-router-dom'
import { getIntl }                        from '@acx-ui/utils'

import { APStatus } from '.'

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
        renderer: (record: APExtended) => (
          <APStatus status={record.deviceStatus as ApDeviceStatusEnum} />
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
  const deviceGroupNameGroupableOptions = {
    key: 'deviceGroupName',
    label: 'AP Group',
    actions: [
      {
        key: 'edit',
        renderer: (record: APExtended) => record.deviceGroupName
          ? <TenantLink to={`devices/apgroups/${record.deviceGroupId}/edit`}>
            {$t(defineMessage({ defaultMessage: 'Edit' }))}
          </TenantLink>
          : <span></span>
      }, {
        key: 'delete',
        renderer: (record: APExtended) => record.deviceGroupName
          ? <Button
            style={{
              padding: '0px',
              margin: '0px',
              height: '0px',
              top: '-1px'
            }}
            type='link'
            size='small'
            onClick={() => {
              apAction?.showDeleteApGroups(record, params?.tenantId || '')
            }}
          >
            {$t(defineMessage({ defaultMessage: 'Delete' }))}
          </Button>
          : <span></span>

      }
    ],
    attributes: [
      {
        key: 'AP Group',
        renderer: (record: APExtended) => record.deviceGroupName
          ? <div style={{ fontStyle: 'bold' }}>{record.deviceGroupName}</div>
          : $t({ defaultMessage: 'Ungrouped APs' })
      },
      ...commonAttributes($t)
    ]
  }
  return { deviceStatusGroupableOptions, deviceGroupNameGroupableOptions, modelGroupableOptions }
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
