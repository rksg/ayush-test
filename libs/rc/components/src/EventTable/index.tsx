import { useState } from 'react'

import _                                            from 'lodash'
import moment                                       from 'moment'
import { defineMessage, useIntl, FormattedMessage } from 'react-intl'

import { Loader, Table, TableProps, Button, Tooltip }                        from '@acx-ui/components'
import { Features, useIsSplitOn }                                            from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, Event, RequestPayload, TableQuery, replaceStrings } from '@acx-ui/rc/utils'
import { TenantLink, generatePath }                                          from '@acx-ui/react-router-dom'
import { formatter, useDateFilter }                                          from '@acx-ui/utils'

import { TimelineDrawer } from '../TimelineDrawer'

import { severityMapping, eventTypeMapping, productMapping } from './mapping'
import * as UI                                               from './styledComponents'

// rename to prevent it being parse by extraction process
const FormatMessage = FormattedMessage

export const useEventTableFilter = () => {
  const { startDate, endDate } = useDateFilter()
  return {
    fromTime: moment(startDate).milliseconds(0).toISOString().replace('.000', ''),
    toTime: moment(endDate).milliseconds(0).toISOString().replace('.000', '')
  }
}

export const defaultPayload = {
  url: CommonUrlsInfo.getEventList.url,
  fields: [
    'event_datetime',
    'severity',
    'entity_type',
    'product',
    'entity_id',
    'message',
    'dpName',
    'apMac',
    'clientMac',
    'macAddress',
    'apName',
    'switchName',
    'serialNumber',
    'networkName',
    'networkId',
    'ssid',
    'radio',
    'raw_event',
    'sourceType',
    'adminName',
    'clientName',
    'userName',
    'hostname',
    'adminEmail',
    'administratorEmail',
    'venueName',
    'venueId',
    'apGroupId',
    'apGroupName',
    'floorPlanName',
    'recipientName',
    'transactionId',
    'name'
  ],
  filters: {
    entity_type: ['AP', 'CLIENT', 'SWITCH', 'NETWORK']
  }
}

export const defaultSorter = {
  sortField: 'event_datetime',
  sortOrder: 'DESC'
}

interface EventTableProps {
  tableQuery: TableQuery<Event, RequestPayload<unknown>, unknown>
}

type EntityType = typeof entityTypes[number]
type EntityExistsKey = `is${Capitalize<EntityType>}Exists`
const entityTypes = ['ap', 'client', 'network', 'switch', 'venue'] as const

function EntityLink ({ entityKey, data }: { entityKey: keyof Event, data: Event }) {
  const pathSpecs: Record<
    typeof entityTypes[number],
    { path: string, params: Array<keyof Event>, disabled?: boolean }
  > = {
    ap: {
      path: 'devices/wifi/:serialNumber/details/overview',
      params: ['serialNumber']
    },
    client: {
      path: 'users/wifi/clients/:clientMac/details/overview',
      params: ['clientMac']
    },
    network: {
      // TODO:
      // change to overview when overview page ready
      path: 'networks/:networkId/network-details/aps',
      params: ['networkId']
    },
    switch: {
      path: 'devices/switch/:switchMac/:serialNumber/details/overview',
      params: ['switchMac', 'serialNumber'],
      disabled: !useIsSplitOn(Features.DEVICES)
    },
    venue: {
      path: 'venues/:venueId/venue-details/overview',
      params: ['venueId']
    }
  }

  const [entity] = _.kebabCase(entityKey).split('-') as [EntityType]
  const name = <>{String(data[entityKey])}</>

  if (!entityTypes.includes(entity)) return name

  const existKey = `is${_.capitalize(entity)}Exists` as EntityExistsKey
  const exists = data[existKey]

  if (!exists) return <Tooltip
    title={<FormattedMessage defaultMessage='Not available' />}
    children={<UI.Disabled>{name}</UI.Disabled>}
  />

  const spec = pathSpecs[entity]
  const params = spec.params.map(key => [key, String(data[key])])

  if (spec.disabled) return name

  return <TenantLink
    to={generatePath(spec.path, Object.fromEntries(params))}
    children={name}
  />
}

const getSource = (data: Event) => {
  const sourceMapping = {
    AP: 'apName',
    CLIENT: 'clientName',
    NETWORK: 'apName',
    VENUE: 'venueName',
    SWITCH: 'switchName'
  } as const
  const entityKey = sourceMapping[data.entity_type as keyof typeof sourceMapping]
  return <EntityLink {...{ entityKey, data }} />
}

const getDescription = (data: Event) => {
  let message = data.message && JSON.parse(data.message).message_template

  const template = replaceStrings(message, data, (key) => `<entity>${key}</entity>`)

  return <FormatMessage
    id='events-description-template'
    // escape ' by replacing with '' as it is special character of formatjs
    defaultMessage={template.replaceAll("'", "''")}
    values={{
      entity: (chunks) => <EntityLink
        entityKey={String(chunks[0]) as keyof Event}
        data={data}
      />
    }}
  />
}

export const EventTable = ({ tableQuery }: EventTableProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<Event>()

  const columns: TableProps<Event>['columns'] = [
    {
      key: 'event_datetime',
      title: $t({ defaultMessage: 'Date' }),
      dataIndex: 'event_datetime',
      defaultSortOrder: 'descend',
      sorter: true,
      render: function (_, row) {
        return <Button
          type='link'
          size='small'
          onClick={()=>{
            setVisible(true)
            setCurrent(row)
          }}
        >{formatter('dateTimeFormatWithSeconds')(row.event_datetime)}</Button>
      }
    },
    {
      key: 'severity',
      title: $t({ defaultMessage: 'Severity' }),
      dataIndex: 'severity',
      sorter: true,
      render: function (_, row) {
        const msg = severityMapping[row.severity as keyof typeof severityMapping]
        return $t(msg)
      }
    },
    {
      key: 'entity_type',
      title: $t({ defaultMessage: 'Event Type' }),
      dataIndex: 'entity_type',
      sorter: true,
      render: function (_, row) {
        const msg = eventTypeMapping[
          row.entity_type as keyof typeof eventTypeMapping]
        return $t(msg)
      }
    },
    {
      key: 'product',
      title: $t({ defaultMessage: 'Product' }),
      dataIndex: 'product',
      sorter: true,
      render: function (_, row) {
        const msg = productMapping[row.product as keyof typeof productMapping]
        return $t(msg)
      }
    },
    {
      key: 'source',
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'source',
      sorter: true,
      render: function (_, row) {
        return getSource(row)
      }
    },
    {
      key: 'message',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'message',
      sorter: true,
      render: function (_, row) {
        return getDescription(row)
      }
    }
  ]
  const getDrawerData = (data: Event) => [
    {
      title: defineMessage({ defaultMessage: 'Time' }),
      value: formatter('dateTimeFormatWithSeconds')(data.event_datetime)
    },
    {
      title: defineMessage({ defaultMessage: 'Severity' }),
      value: (() => {
        const msg = severityMapping[data.severity as keyof typeof severityMapping]
        return $t(msg)
      })()
    },
    {
      title: defineMessage({ defaultMessage: 'Event Type' }),
      value: (() => {
        const msg = eventTypeMapping[
          data.entity_type as keyof typeof eventTypeMapping]
        return $t(msg)
      })()
    },
    {
      title: defineMessage({ defaultMessage: 'Source' }),
      value: getSource(data)
    },
    {
      title: defineMessage({ defaultMessage: 'Description' }),
      value: getDescription(data)
    }
  ]

  return <Loader states={[tableQuery]}>
    <Table
      rowKey='id'
      columns={columns}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
    />
    {visible && <TimelineDrawer
      title={defineMessage({ defaultMessage: 'Event Details' })}
      visible={visible}
      onClose={()=>setVisible(false)}
      data={getDrawerData(current!)}
    />}
  </Loader>
}

