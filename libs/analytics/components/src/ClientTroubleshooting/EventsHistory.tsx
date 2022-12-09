
import { List }    from 'antd'
import { flatten } from 'lodash'
import { IntlShape, useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'


import { ArrowCollapse } from '@acx-ui/icons'
import { TenantLink } from '@acx-ui/react-router-dom'
import { formatter }        from '@acx-ui/utils'

import {
  incidentInformation,
  Incident,
  calculateSeverity,
  incidentSeverities,
  shortDescription,
  categoryOptions
} from '@acx-ui/analytics/utils'

import * as UI from './styledComponents'
import { ClientInfoData } from './services'
import { Filters } from '.'
import {
  transformEvents,
  DisplayEvent,
  formatEventDesc,
  eventColorByCategory
} from './config'
import { ReactNode } from 'react'

type HistoryContentProps = {
  historyContentToggle : boolean,
  setHistoryContentToggle : CallableFunction,
  data?: ClientInfoData,
  filters: Filters
}
type Item = {
  id?: string,
  start: number,
  date: string,
  description: string,
  title: string,
  icon: ReactNode
}

const transformData = (clientInfo: ClientInfoData, filters: Filters, intl: IntlShape) => {
  const types = filters ? filters.type ?? [] : []
  const radios = filters ? filters.radio ?? [] : []
  const selectedCategories: string[] = filters ? filters.category ?? [] : []
  const events = transformEvents(
    clientInfo.connectionEvents,
    flatten(types),
    flatten(radios)
  ) as DisplayEvent[]
  const incidents = clientInfo.incidents.reduce((acc, incident: Incident) => {
    const {
      category,
      subCategory,
      shortDescription: desc
    } = incidentInformation[incident.code]
    const severity = calculateSeverity(incident.severity)
    const color = incidentSeverities[severity].color
    const title = shortDescription({ ...incident, shortDescription: desc })
    const cat = categoryOptions.find(
      ({ label }) => intl.$t(label) === intl.$t(category)
    )
    if (selectedCategories.length &&
      cat &&
      !flatten(selectedCategories).includes(cat.value)
    ) {
      return acc
    }
    acc.push({
      id: incident.id,
      start: +new Date(incident.startTime),
      date: formatter('dateTimeFormatWithSeconds')(incident.startTime),
      description: `${intl.$t(category)} (${intl.$t(subCategory)})`,
      title,
      icon: <UI.IncidentEvent color={color}>{severity}</UI.IncidentEvent>
    })
    return acc
  }, [] as Item[])
  return [ ...events.map((event: DisplayEvent) => {
    const color = eventColorByCategory[event.category as keyof typeof eventColorByCategory]
   return {
    start: event.start,
    date: formatter('dateTimeFormatWithSeconds')(event.start),
    description: formatEventDesc(event, intl),
    title: formatEventDesc(event, intl),
    icon: <UI.EventTypeIcon color={color} />
   }
  }),
  ...incidents
  ].sort((a,b) => a.start - b.start)
}


const renderItem = (item: Item) => {
  const Item = <List.Item title={item.title}>
    <List.Item.Meta
      avatar={item.icon}
      title={item.date}
      description={item.description}
    />
  </List.Item>
  return item.id
  ? <TenantLink to={`analytics/incidents/${item.id}`}>{Item}</TenantLink> 
  : Item
}

export function History (props : HistoryContentProps) {
  const intl = useIntl()
  const { $t } = intl
  const { setHistoryContentToggle, historyContentToggle, data, filters } = props
  const histData = transformData(data!, filters, intl)
  return (
    <UI.History>
      <UI.HistoryHeader>
        <UI.HistoryContentTitle>
          {$t({ defaultMessage: 'History' })}
        </UI.HistoryContentTitle>
        <UI.HistoryIcon>
          <ArrowCollapse
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
            renderItem={renderItem}
          />
        </UI.HistoryContent>
        )}
      </AutoSizer>
    </UI.History>   
  )
}