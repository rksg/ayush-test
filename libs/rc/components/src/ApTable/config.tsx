import { defineMessage } from 'react-intl'

import { ApDeviceStatusEnum, APExtended } from '@acx-ui/rc/utils'
import { TenantLink }                     from '@acx-ui/react-router-dom'
import { getIntl }                        from '@acx-ui/utils'

import { APStatus } from '.'

export const getGroupableConfig = () => {
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
  }
  const modelGroupableOptions = {
    key: 'model',
    label: 'Model',
    attributes: [
      {
        key: 'model',
        renderer: (record: APExtended) => <div style={{ fontStyle: 'bold' }}>{record.model}</div>
      },
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
  }
  const deviceGroupNameGroupableOptions = {
    key: 'deviceGroupName',
    label: 'AP Group',
    actions: [
      {
        key: 'edit',
        renderer: (record: APExtended) => (
          <TenantLink to={`devices/apgroups/${record.deviceGroupId}/edit`}>
            {$t(defineMessage({ defaultMessage: 'Edit' }))}
          </TenantLink>
        )
      }
    ],
    attributes: [
      {
        key: 'AP Group',
        renderer: (record: APExtended) => (
          <div style={{ fontStyle: 'bold' }}>{record.deviceGroupName}</div>
        )
      },
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
        renderer: (record: APExtended) => <div>Incidents (24 hours): {record.incidents}</div>
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
  }
  return { deviceStatusGroupableOptions, deviceGroupNameGroupableOptions, modelGroupableOptions }
}
