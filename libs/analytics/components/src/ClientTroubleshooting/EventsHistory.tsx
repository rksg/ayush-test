import { createRef, ReactNode, useEffect } from 'react'

import { List }               from 'antd'
import { flatten }            from 'lodash'
import { IntlShape, useIntl } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { ArrowCollapse }             from '@acx-ui/icons'
import { TenantLink }                from '@acx-ui/react-router-dom'
import { hasAccess }                 from '@acx-ui/user'

import {
  DisplayEvent,
  eventColorByCategory,
  IncidentDetails
} from './config'
import { ConnectionEventPopover }                              from './ConnectionEvent'
import { ClientInfoData }                                      from './services'
import * as UI                                                 from './styledComponents'
import { transformEvents,formatEventDesc, transformIncidents } from './util'

import { Filters } from '.'

type HistoryContentProps = {
  historyContentToggle : boolean,
  setHistoryContentToggle : CallableFunction,
  data?: ClientInfoData,
  filters: Filters | null,
  onPanelCallback: (item: IncidentDetails | FormattedEvent) => {
    onClick: (val: boolean) => void,
    selected: () => boolean | undefined
  }
}

export type FormattedEvent = {
  start: number,
  date: string,
  description: string,
  title: string,
  icon: ReactNode,
  id: string,
  event: DisplayEvent
}

const transformData = (clientInfo: ClientInfoData, filters: Filters, intl: IntlShape) => {
  const types: string[] = flatten(filters ? filters.type ?? [[]] : [[]])
  const radios: string[] = flatten(filters ? filters.radio ?? [[]] : [[]])
  const selectedCategories: string[] = flatten(filters ? filters.category ?? [[]] : [[]])
  const events = transformEvents(
    clientInfo.connectionEvents,
    types,
    radios
  ) as DisplayEvent[]
  const incidents = transformIncidents(
    clientInfo.incidents,
    selectedCategories,
    types,
    intl
  )
  return [ ...events.map((event: DisplayEvent) => {
    const color = eventColorByCategory[event.category as keyof typeof eventColorByCategory]
    return {
      start: event.start,
      date: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(event.start),
      description: formatEventDesc(event, intl),
      title: formatEventDesc(event, intl),
      icon: <>
        <UI.EventTypeIcon color={color} data-testid='history-item-icon'/>
        {typeof event.pcapFilename === 'string' && <UI.Download />}
      </>,
      event
    }
  }),
  ...incidents
  ].sort((a,b) => a.start - b.start)
}

const renderItem = (
  item: IncidentDetails | FormattedEvent,
  onPanelCallback: (item: IncidentDetails | FormattedEvent) => {
    onClick: (val: boolean) => void,
    selected: () => boolean | undefined
  }
) => {
  const { onClick, selected } = onPanelCallback(item)
  return <WrappedItem
    item={item}
    onClick={onClick}
    selected={selected()}
    key={item.id ?? (item as FormattedEvent).event.key}
  />
}

function WrappedItem (
  { item, onClick, selected }:
  { item: IncidentDetails | FormattedEvent,
    onClick: (val: boolean) => void,
    selected: boolean | undefined }
) {
  const ref = createRef<HTMLDivElement>()
  useEffect(() => {
    if (selected && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selected, ref])
  const Item = <List.Item title={item.title}>
    <List.Item.Meta
      avatar={item.icon}
      title={item.date}
      description={item.description} />
  </List.Item>
  return item.id
    ? (Boolean(get('IS_MLISA_SA')) || hasAccess())
      ? <TenantLink to={`analytics/incidents/${item.id}`}>{Item}</TenantLink>
      : Item
    : <ConnectionEventPopover
      event={(item as FormattedEvent).event}
      onVisibleChange={onClick}
      visible={selected}
      placement='leftBottom'>
      <UI.HistoryItemWrapper $selected={selected} ref={ref}>{Item}</UI.HistoryItemWrapper>
    </ConnectionEventPopover>
}

export function History (props : HistoryContentProps) {
  const intl = useIntl()
  const { $t } = intl
  const { setHistoryContentToggle, historyContentToggle, data, filters, onPanelCallback } = props
  const histData = transformData(data!, filters!, intl)
  return (
    <UI.History>
      <UI.HistoryHeader>
        <UI.HistoryContentTitle>
          {$t({ defaultMessage: 'History' })}
        </UI.HistoryContentTitle>
        <UI.HistoryIcon>
          <ArrowCollapse
            data-testid='history-collapse'
            onClick={() => {
              setHistoryContentToggle(!historyContentToggle)
            }}
          />
        </UI.HistoryIcon>
      </UI.HistoryHeader>
      <AutoSizer>
        {({ height, width }) => (
          <UI.HistoryContent style={{ height: height - 44, width }}>
            <List
              itemLayout='horizontal'
              dataSource={histData}
              renderItem={(item) => renderItem(item, onPanelCallback)}
            />
          </UI.HistoryContent>
        )}
      </AutoSizer>
    </UI.History>
  )
}