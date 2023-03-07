import React, { useState } from 'react'

import _                                            from 'lodash'
import moment                                       from 'moment'
import { defineMessage, useIntl, FormattedMessage } from 'react-intl'

import { Loader, Table, TableProps, TableHighlightFnArgs, Button, Tooltip }                 from '@acx-ui/components'
import { Features, useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                                        from '@acx-ui/formatter'
import { CommonUrlsInfo, Event, RequestPayload, TableQuery, replaceStrings, noDataDisplay } from '@acx-ui/rc/utils'
import { TenantLink, generatePath }                                                         from '@acx-ui/react-router-dom'
import { useDateFilter }                                                                    from '@acx-ui/utils'

import { TimelineDrawer } from '../TimelineDrawer'

import { severityMapping, eventTypeMapping, productMapping } from './mapping'
import * as UI                                               from './styledComponents'

// rename to prevent it being parse by extraction process
const FormatMessage = FormattedMessage

export const useEventTableFilter = () => {
  const { startDate, endDate } = useDateFilter()
  return {
    fromTime: moment(startDate).utc().format(),
    toTime: moment(endDate).utc().format()
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

export const defaultSearch = {
  searchTargetFields: ['entity_id', 'message', 'apMac', 'clientMac']
}

interface EventTableProps {
  tableQuery: TableQuery<Event, RequestPayload<unknown>, unknown>,
  searchables?: boolean | string[]
  filterables?: boolean | string[]
}

type EntityType = typeof entityTypes[number]
type EntityExistsKey = `is${Capitalize<EntityType>}Exists`
const entityTypes =
  ['ap', 'client', 'network', 'switch', 'venue', 'adminName'] as const

function EntityLink ({ entityKey, data, highlightFn = val => val }: {
  entityKey: keyof Event, data: Event, highlightFn?: TableHighlightFnArgs
}) {
  const pathSpecs: Partial<Record<
  typeof entityTypes[number],
  { path: string, params: Array<keyof Event>, disabled?: boolean }
>> = {
  ap: {
    path: 'devices/wifi/:serialNumber/details/overview',
    params: ['serialNumber']
  },
  client: {
    path: 'users/wifi/clients/:clientMac/details/overview',
    params: ['clientMac']
  },
  network: {
    path: 'networks/wireless/:networkId/network-details/overview',
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
  const name = <>{highlightFn(String(data[entityKey]))}</>

  if (!entityTypes.includes(entity)) return name

  const existKey = `is${_.capitalize(entity)}Exists` as EntityExistsKey
  const exists = data[existKey as keyof typeof data]

  if (!exists) return <Tooltip
    title={<FormattedMessage defaultMessage='Not available' />}
    children={<UI.Disabled>{name}</UI.Disabled>}
  />

  const spec = pathSpecs[entity]
  if (!spec) return name

  const params = spec.params.map(key => [key, String(data[key])])

  if (spec.disabled) return name

  return <TenantLink
    to={generatePath(spec.path, Object.fromEntries(params))}
    children={name}
  />
}

const getSource = (data: Event, highlightFn?: TableHighlightFnArgs) => {
  const sourceMapping = {
    AP: 'apName',
    CLIENT: 'clientName',
    NETWORK: 'apName',
    VENUE: 'venueName',
    SWITCH: 'switchName',
    ADMINACTIVITY: 'adminName',
    ADMIN: 'adminName',
    NOTIFICATION: 'adminName'
  } as const
  const entityKey = sourceMapping[data.entity_type as keyof typeof sourceMapping]
  return <EntityLink {...{ entityKey, data, highlightFn }} />
}

const getDescription = (data: Event, highlightFn?: TableHighlightFnArgs) => {
  try {
    let message = data.message && JSON.parse(data.message).message_template

    const template = replaceStrings(message, data, (key) => `<entity>${key}</entity>`)
    const highlighted = (highlightFn
      ? highlightFn(template, (key) => `<b>${key}</b>`)
      : template) as string

    return <FormatMessage
      id='events-description-template'
      // escape ' by replacing with '' as it is special character of formatjs
      defaultMessage={highlighted.replaceAll("'", "''")}
      values={{
        entity: (chunks) => <EntityLink
          entityKey={String(chunks[0]) as keyof Event}
          data={data}
          highlightFn={highlightFn}
        />,
        b: (chunks) => <Table.Highlighter>{chunks}</Table.Highlighter>
      }}
    />
  } catch {
    return noDataDisplay
  }
}

export const EventTable = ({
  tableQuery, searchables = true, filterables = true
}: EventTableProps) => {
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
        >{formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.event_datetime)}</Button>
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
      },
      filterable: (Array.isArray(filterables) ? filterables.includes('severity') : filterables)
        && Object.entries(severityMapping).map(([key, value])=>({ key, value: $t(value) }))
    },
    {
      key: 'entity_type',
      title: $t({ defaultMessage: 'Event Type' }),
      dataIndex: 'entity_type',
      sorter: true,
      render: function (_, row) {
        const msg = eventTypeMapping[
          row.entity_type as keyof typeof eventTypeMapping] ?? row.entity_type
        return $t(msg)
      },
      filterable: (Array.isArray(filterables) ? filterables.includes('entity_type') : filterables)
        && Object.entries(eventTypeMapping).map(([key, value])=>({ key, value: $t(value) }))
    },
    {
      key: 'product',
      title: $t({ defaultMessage: 'Product' }),
      dataIndex: 'product',
      sorter: true,
      render: function (_, row) {
        const msg = productMapping[row.product as keyof typeof productMapping]
        return (row.product && msg) ? $t(msg) : row.product ?? noDataDisplay
      },
      filterable: (Array.isArray(filterables) ? filterables.includes('product') : filterables)
        && Object.entries(productMapping).map(([key, value])=>({ key, value: $t(value) }))
    },
    {
      key: 'source',
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'entity_type',
      sorter: true,
      render: function (_, row, __, highlightFn) {
        const searchable = Array.isArray(searchables)
          ? searchables.includes('entity_type') : searchables
        return getSource(row, searchable ? highlightFn : v => v)
      },
      searchable: Array.isArray(searchables) ? searchables.includes('entity_type') : searchables
    },
    {
      key: 'message',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'message',
      sorter: true,
      render: function (_, row, __, highlightFn) {
        const searchable = Array.isArray(searchables)
          ? searchables.includes('message') : searchables
        return getDescription(row, searchable ? highlightFn : v => v)
      },
      searchable: Array.isArray(searchables) ? searchables.includes('message') : searchables
    }
  ]
  const getDrawerData = (data: Event) => [
    {
      title: defineMessage({ defaultMessage: 'Time' }),
      value: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(data.event_datetime)
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
          data.entity_type as keyof typeof eventTypeMapping] ?? data.entity_type
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
      dataSource={tableQuery.data?.data ?? []}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      enableApiFilter={true}
    />
    {visible && <TimelineDrawer
      title={defineMessage({ defaultMessage: 'Event Details' })}
      visible={visible}
      onClose={()=>setVisible(false)}
      data={getDrawerData(current!)}
    />}
  </Loader>
}
