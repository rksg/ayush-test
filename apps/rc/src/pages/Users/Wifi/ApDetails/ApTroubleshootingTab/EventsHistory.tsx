
import { List }    from 'antd'
import { useIntl } from 'react-intl'

import { ArrowExpand } from '@acx-ui/icons'

import * as UI from './styledComponents'
type HistoryContentProps = {
    historyContentToggle : boolean,
    setHistoryContentToggle : CallableFunction
  }

const sampleData = [
  {
    date: '06/07/2022 11:21:48',
    description: 'Infrastructure (Service availabilty)',
    icon: <UI.EventTypeIcon color='--acx-semantics-green-50'/>
  },
  {
    date: '06/07/2022 11:21:48',
    description: 'Client assiocated (802.11) @ Home_R860 (AA:BB...',
    icon: <UI.EventTypeIcon color='--acx-neutrals-50'/>
  },
  {
    date: '06/07/2022 11:21:48',
    description: 'Client assiocated (802.11) @ Home_R860 (AA...',
    icon: <UI.EventTypeIcon color='--acx-semantics-green-50'/>
  }
]
export function History (props : HistoryContentProps) {
  const { $t } = useIntl()
  const { setHistoryContentToggle, historyContentToggle } = props
  return (
    <UI.History>
      <UI.HistoryHeader>
        <UI.HistoryContentTitle>
          {$t({ defaultMessage: 'History' })}
        </UI.HistoryContentTitle>
        <UI.HistoryIcon>
          <ArrowExpand
            style={{
              transform: 'rotate(180deg)',
              cursor: 'pointer',
              lineHeight: '20px'
            }}
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