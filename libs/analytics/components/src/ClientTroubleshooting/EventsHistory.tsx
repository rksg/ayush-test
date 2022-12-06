
import { List }    from 'antd'
import { useIntl } from 'react-intl'

import { failureCodeTextMap } from '@acx-ui/analytics/utils'
import { CollapseInactive }   from '@acx-ui/icons'

import { transformEvents }                 from './config'
import { ConnectionEvents }                from './ConnectionEvents'
import { ClientInfoData, ConnectionEvent } from './services'
import * as UI                             from './styledComponents'

import { Filters } from '.'


type HistoryContentProps = {
    historyContentToggle : boolean,
    setHistoryContentToggle : CallableFunction,
    data?: ClientInfoData,
    filters: Filters
  }
type DisplayEvent = {
  start: number,
  end: number,
  code: string,
  apName: string,
  mac: string,
  radio: string
}
const transformData = (clientInfo: ClientInfoData, filters: Filters) => {
  const [ types = [] ] = filters?.type ?? [[]]
  const [ radios = [] ] = filters?.radio ?? [[]]
  const events = transformEvents(
    clientInfo.connectionEvents,
    types.concat(radios)
  ) as DisplayEvent[]
  return events.map((event: DisplayEvent) => {
    const { code, apName, mac, radio, ...data } = event

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
  const { $t } = useIntl()
  const { setHistoryContentToggle, historyContentToggle, data, filters } = props
  const histData = transformData(data!, filters)
  console.log(histData)
  return (
    <UI.History>
      <UI.HistoryHeader>
        <UI.HistoryContentTitle>
          {$t({ defaultMessage: 'History' })}
        </UI.HistoryContentTitle>
        <UI.HistoryIcon>
          <CollapseInactive
            onClick={() => {
              setHistoryContentToggle(!historyContentToggle)
            }}
          />
        </UI.HistoryIcon>
      </UI.HistoryHeader>
      <UI.HistoryContent>
        <List
          itemLayout='horizontal'
          dataSource={sampleData}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={item.icon}
                title={item.date}
                description={item.description} />
            </List.Item>
          )}
        />
      </UI.HistoryContent>
    </UI.History>
  )
}