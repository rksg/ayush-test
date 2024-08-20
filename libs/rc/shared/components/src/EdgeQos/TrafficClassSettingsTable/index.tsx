
import { useIntl } from 'react-intl'

import { Table, TableProps, cssStr }                                     from '@acx-ui/components'
import { TrafficClassSetting, priorityToDisplay, trafficClassToDisplay } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

const genClassTextForToolTip =
  (trafficClass?: string, priority?: string, priorityScheduling?: boolean) => {
    const capFirstClass = trafficClassToDisplay(trafficClass)
    const capFirstPriority = priorityToDisplay(priority)
    const starSolidWhite = priorityScheduling === true ?
      <UI.StarSolidCustom
        height={8}
        width={12}
        color={cssStr('--acx-primary-white')}/> : undefined
    return <>{capFirstClass + ' (' + capFirstPriority + ') '}{starSolidWhite}</>
  }

const genBandWidthTextForToolTip = (bandwidth?: number) => {
  return bandwidth ? bandwidth + '%' : ''
}

interface TrafficClassSettingsProps {
  trafficClassSettings: TrafficClassSetting[]
}

export const TrafficClassSettingsTable = (props: TrafficClassSettingsProps) => {

  const { $t } = useIntl()

  const columns: TableProps<TrafficClassSetting>['columns'] = [
    {
      key: 'trafficClass',
      title: $t({ defaultMessage: 'Class' }),
      dataIndex: 'trafficClass',
      render: function (_, row) {
        return genClassTextForToolTip(row.trafficClass, row.priority, row.priorityScheduling)
      }
    },
    {
      key: 'minBandwidth',
      title: $t({ defaultMessage: 'Guaranteed BW' }),
      dataIndex: 'minBandwidth',
      render: function (_, row) {
        return genBandWidthTextForToolTip(row?.minBandwidth)
      }
    },
    {
      key: 'maxBandwidth',
      title: $t({ defaultMessage: 'Max BW' }),
      dataIndex: 'maxBandwidth',
      render: function (_, row) {
        return genBandWidthTextForToolTip(row.maxBandwidth)
      }
    }
  ]

  return (
    <Table
      type='compactBordered'
      style={{ width: 400 }}
      columns={columns}
      dataSource={props.trafficClassSettings}
    />
  )
}
