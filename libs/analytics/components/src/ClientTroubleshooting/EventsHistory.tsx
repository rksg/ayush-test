
import { List }               from 'antd'
import { IntlShape, useIntl } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { ArrowCollapse } from '@acx-ui/icons'
import { formatter }     from '@acx-ui/utils'

import { transformEvents, DisplayEvent, formatEventDesc, eventColorByCategory } from './config'
import { ConnectionEvents }                                                     from './ConnectionEvents'
import { ClientInfoData }                                                       from './services'
import * as UI                                                                  from './styledComponents'

import { Filters } from '.'


type HistoryContentProps = {
    historyContentToggle : boolean,
    setHistoryContentToggle : CallableFunction,
    data?: ClientInfoData,
    filters: Filters
  }

const transformData = (clientInfo: ClientInfoData, filters: Filters, intl: IntlShape) => {
  const types = filters ? filters.type ?? [] : []
  const radios = filters ? filters.radio ?? [] : []
  const events = transformEvents(
    clientInfo.connectionEvents,
    types,
    radios
  ) as DisplayEvent[]
  return events.map((event: DisplayEvent) => {
    const color = eventColorByCategory[event.category as keyof typeof eventColorByCategory]
    return {
      date: formatter('dateTimeFormatWithSeconds')(event.start),
      description: formatEventDesc(event, intl),
      icon: <UI.EventTypeIcon color={color} />
    }
  })
}
const sampleData = [
  {
    date: '06/07/2022 11:21:48',
    description: 'Infrastructure (Service availabilty)',
    icon: <ConnectionEvents><UI.EventTypeIcon color='--acx-semantics-green-50'/></ConnectionEvents>
  },
  {
    date: '06/07/2022 11:21:48',
    description: 'Client assiocated (802.11) @ Home_R860 (AA:BB:CC:DD:FF:GG)',
    icon: <UI.EventTypeIcon color='--acx-neutrals-50'/>
  },
  {
    date: '06/07/2022 11:21:48',
    description: 'Client assiocated (802.11) @ Home_R860 (AA:BB:CC:DD:FF:GG)',
    icon: <UI.IncidentEvent color='--acx-semantics-red-50'>P1</UI.IncidentEvent>
  }
]
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
              renderItem={(item) => (
                <List.Item title={item.description}>
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.date}
                    description={item.description} />
                </List.Item>
              )}
            />
          </UI.HistoryContent>
        )}
      </AutoSizer>
    </UI.History>
  )
}