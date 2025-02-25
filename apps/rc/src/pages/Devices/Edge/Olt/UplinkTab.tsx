import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'
import { noDataDisplay }     from '@acx-ui/utils'

interface UplinkPortDataModel {
  portIdx: number
  state: string
  speed?: number
}

const uplinkPortsData: UplinkPortDataModel[] = [{
  portIdx: 1,
  state: 'on',
  speed: 40
}, {
  portIdx: 2,
  state: 'off'
}]

export const UplinkTab = () => {
  const { $t } = useIntl()

  const columns: TableProps<UplinkPortDataModel>['columns'] = [
    {
      key: 'portIdx',
      title: $t({ defaultMessage: 'Port' }),
      dataIndex: 'portIdx',
      fixed: 'left'
    },
    {
      key: 'speed',
      title: $t({ defaultMessage: 'Speed' }),
      dataIndex: 'speed',
      width: 80,
      render: (_, row) => row.state === 'on'
        ? `${get(row, 'speed')} Gbps`
        : noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'state',
      dataIndex: 'state',
      width: 80,
      render: (_, row) =>
        row.state === 'on' ? $t({ defaultMessage: 'On' }) : $t({ defaultMessage: 'Off' })
    }
  ]


  return <Table
    rowKey='portIdx'
    columns={columns}
    dataSource={uplinkPortsData}
  />
}