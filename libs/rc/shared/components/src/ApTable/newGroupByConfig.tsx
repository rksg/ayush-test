import React from 'react'

import { Button }                   from 'antd'
import { defineMessage, IntlShape } from 'react-intl'

import { ApDeviceStatusEnum, APExtended, NewAPModel, NewAPModelExtended, PowerSavingStatusEnum } from '@acx-ui/rc/utils'
import { TenantLink }                                                                            from '@acx-ui/react-router-dom'
import { getIntl }                                                                               from '@acx-ui/utils'

import { SimpleListTooltip } from '../SimpleListTooltip'

import { APStatus } from '.'

const commonAttributes = ($t: IntlShape['$t']) => [
  {
    key: 'venue',
    renderer: (record: NewAPModelExtended) => {
      return <div>
        {/* eslint-disable-next-line max-len */}
        Venue: {record.children?.length! > 0 && <TenantLink to={`/venues/${(record.children as NewAPModel[])[0].venueId}/venue-details/overview`}>
          {(record.children as NewAPModel[])[0].venueName}
        </TenantLink>}
      </div>
    }
  },
  {
    key: 'members',
    renderer: (record: NewAPModelExtended) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Members' }))}: {record.members}
      </div>
    )
  },
  {
    key: 'incidents',
    renderer: (record: NewAPModelExtended) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Incidents (24 hours)' }))}: {record.incidents}
      </div>
    )
  },
  {
    key: 'clients',
    renderer: (record: NewAPModelExtended) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Connected Clients' }))}: {record.clients}
      </div>
    )
  },
  {
    key: 'networks',
    renderer: (record: NewAPModelExtended) => (
      <div>
        {$t(defineMessage({ defaultMessage: 'Wireless Networks' }))}:{' '}
        {record?.networksInfo ? <SimpleListTooltip
          items={record?.networksInfo.names!}
          displayText={record?.networksInfo.count!} /> : 0}
      </div>
    )
  }
]

export const getGroupableConfig = (
  apAction?: {
    showDeleteApGroups: (record: APExtended, callBack?: () => void) => void
  } ) => {
  const { $t } = getIntl()
  const deviceStatusGroupableOptions = {
    key: 'status',
    label: 'Status',
    attributes: [
      {
        key: 'status',
        renderer: (record: NewAPModelExtended) => (
          <APStatus
            status={record.status as ApDeviceStatusEnum}
            powerSavingStatus={record.powerSavingStatus as PowerSavingStatusEnum}
          />
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
        renderer: (record: NewAPModelExtended) =>
          <div style={{ fontStyle: 'bold' }}>{record.model}</div>
      },
      ...commonAttributes($t)
    ]
  }
  const deviceGroupNameGroupableOptions = {
    key: 'apGroupId',
    label: 'AP Group',
    actions: [
      {
        key: 'edit',
        renderer: (record: NewAPModelExtended) => record.apGroupName &&
          <TenantLink to={`devices/apgroups/${record.apGroupId}/edit/general`}>
            {$t(defineMessage({ defaultMessage: 'Edit' }))}
          </TenantLink>
      }, {
        key: 'delete',
        renderer: (record: NewAPModelExtended) => record.apGroupName &&
          <Button
            style={{
              padding: '0px',
              margin: '0px',
              height: '0px',
              top: '-1px'
            }}
            type='link'
            size='small'
            onClick={() => {
              apAction?.showDeleteApGroups(record as unknown as APExtended)
            }}
          >
            {$t(defineMessage({ defaultMessage: 'Delete' }))}
          </Button>
      }
    ],
    attributes: [
      {
        key: 'AP Group',
        renderer: (record: NewAPModelExtended) => record.apGroupName
          ? <div style={{ fontStyle: 'bold' }}>{record.apGroupName}</div>
          : $t({ defaultMessage: 'Ungrouped APs' })
      },
      ...commonAttributes($t)
    ]
  }
  return { deviceStatusGroupableOptions, deviceGroupNameGroupableOptions, modelGroupableOptions }
}
