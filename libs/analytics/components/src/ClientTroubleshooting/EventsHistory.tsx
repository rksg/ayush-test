import { ReactNode, RefObject } from 'react'

import { List }               from 'antd'
import { EChartsType }        from 'echarts'
import { flatten }            from 'lodash'
import { IntlShape, useIntl } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { ArrowCollapse } from '@acx-ui/icons'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { formatter }     from '@acx-ui/utils'

import {
  DisplayEvent,
  eventColorByCategory,
  IncidentDetails
} from './config'
import { ClientInfoData }                                      from './services'
import * as UI                                                 from './styledComponents'
import { transformEvents,formatEventDesc, transformIncidents } from './util'

import { Filters } from '.'

type HistoryContentProps = {
  historyContentToggle : boolean,
  setHistoryContentToggle : CallableFunction,
  data?: ClientInfoData,
  filters: Filters | null,
  setEventState: (event: DisplayEvent) => void,
  setVisible: (visible: boolean) => void,
  chartsRef: RefObject<EChartsType[]>,
  visible: boolean,
  eventState: DisplayEvent,
  popoverRef: RefObject<HTMLDivElement>
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
      date: formatter('dateTimeFormatWithSeconds')(event.start),
      description: formatEventDesc(event, intl),
      title: formatEventDesc(event, intl),
      icon: <UI.EventTypeIcon color={color}/>,
      event
    }
  }),
  ...incidents
  ].sort((a,b) => a.start - b.start)
}

const renderItem = (
  item: IncidentDetails | FormattedEvent,
  setEventState: CallableFunction,
  setVisible: CallableFunction,
  chartRefs: RefObject<EChartsType[]>,
  visible: boolean,
  eventState: DisplayEvent,
  popoverRef: RefObject<HTMLDivElement>
) => {
  const onClick = onPanelClick(item, chartRefs, popoverRef, setEventState, setVisible)
  const Item = <List.Item title={item.title}>
    <List.Item.Meta
      avatar={item.icon}
      title={item.date}
      description={item.description}
    />
  </List.Item>
  return item.id
    ? <TenantLink to={`analytics/incidents/${item.id}`}>{Item}</TenantLink>
    : <UI.HistoryItemWrapper
      onClick={onClick}
      $selected={getSelectedEvent(visible, eventState, item)}
    >
      {Item}
    </UI.HistoryItemWrapper>
}

export function getSelectedEvent (
  visible: boolean,
  eventState: DisplayEvent,
  item: FormattedEvent | IncidentDetails): boolean | undefined {
  return visible && (eventState?.key === (item as FormattedEvent).event.key)
}

export function onPanelClick (
  item: IncidentDetails | FormattedEvent,
  chartRefs: RefObject<EChartsType[]>,
  popoverRef: RefObject<HTMLDivElement>,
  setEventState: CallableFunction,
  setVisible: CallableFunction) {
  return () => {
    if (item && (item as FormattedEvent).event) {
      const event = (item as FormattedEvent).event
      const key = event.key
      const charts = chartRefs.current
      if (charts && charts.length > 0) {
        const active = charts.filter(chart => !chart.isDisposed())
        let found = false
        const dotChartIndexes = active.map(chart => {
          if (found) return -1
          const option = chart
            .getOption() as unknown as { series: [{ data: [number, string, number | object][] }] }
          const data = option.series[0].data
          for (let i = 0; i < data.length; ++i) {
            const elem = data[i]
            if (typeof elem[2] !== 'number' && (elem[2] as { key: string }).key === key) {
              found = true
              return i
            }
          }
          return -1
        })
        const targetIndex = dotChartIndexes.findIndex(elem => elem > -1)
        const dataIndex = dotChartIndexes[targetIndex]
        const selectedChart = active[targetIndex]
        const dots = selectedChart.getDom().querySelectorAll('path[d="M1 0A1 1 0 1 1 1 -0.0001"]')
        const targetDot = dots[dataIndex]
        if (targetDot && targetDot.getBoundingClientRect) {
          const clientX = targetDot.getBoundingClientRect().x
          const clientY = targetDot.getBoundingClientRect().y
          const popoverChild = popoverRef && popoverRef.current
          if (!popoverChild)
            return
          const { x, y, width } = popoverChild.getBoundingClientRect()
          const calcX = clientX - (x + width / 2)
          const calcY = clientY - y
          setEventState({
            ...(item as FormattedEvent).event,
            x: -calcX,
            y: -calcY
          })
          setVisible(true)
        }
      }
    }
  }
}

export function History (props : HistoryContentProps) {
  const intl = useIntl()
  const { $t } = intl
  const {
    setHistoryContentToggle,
    historyContentToggle,
    data,
    filters,
    setEventState,
    setVisible,
    chartsRef,
    visible,
    eventState,
    popoverRef
  } = props
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
              renderItem={(item) =>
                renderItem(
                  item, setEventState, setVisible, chartsRef, visible, eventState, popoverRef
                )}
            />
          </UI.HistoryContent>
        )}
      </AutoSizer>
    </UI.History>
  )
}