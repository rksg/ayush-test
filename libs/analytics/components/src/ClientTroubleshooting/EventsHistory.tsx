
import { List }    from 'antd'
import { useIntl } from 'react-intl'

import { CollapseInactive } from '@acx-ui/icons'

import * as UI from './styledComponents'
import { ClientInfoData } from './services'
import { Filters } from '.'
import { transformEvents } from './config'

type HistoryContentProps = {
    historyContentToggle : boolean,
    setHistoryContentToggle : CallableFunction,
    data?: ClientInfoData,
    filters: Filters
  }

const transformData = (clientInfo: ClientInfoData, filters: Filters) => {
  const [ types ] = filters?.type ?? [[]]
  const [ radios ] = filters?.radio ?? [[]]
  const events = transformEvents(
    clientInfo.connectionEvents,
    [...(types ?? []), ...(radios ?? [])]
  )
}
const sampleData = [
  {
    date: '06/07/2022 11:21:48',
    description: 'Infrastructure (Service availabilty)',
    icon: <UI.EventTypeIcon color='--acx-semantics-green-50'/>
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