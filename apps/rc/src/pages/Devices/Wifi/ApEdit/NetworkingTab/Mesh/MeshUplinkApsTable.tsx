import { Checkbox }            from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }             from 'react-intl'

import { Table, TableProps }                     from '@acx-ui/components'
import { WifiSignal }                            from '@acx-ui/rc/components'
import { MeshApNeighbor, defaultSort, sortProp } from '@acx-ui/rc/utils'


interface MeshUplinkApsTableProps {
  tableData?: MeshApNeighbor[],
  selected?: string[],
  onSelectChanged: (checked: boolean, mac: string) => void
}

export const MeshUplinkApsTable = (props: MeshUplinkApsTableProps) => {
  const { $t } = useIntl()

  const { tableData=[], selected=[] } = props

  const handleClick = (e: CheckboxChangeEvent, mac: string) => {
    const checked = e.target.checked
    props.onSelectChanged(checked, mac)
  }

  const columns: TableProps<MeshApNeighbor>['columns'] = [
    {
      key: 'mac',
      dataIndex: 'mac',
      render: function (_, row) {
        return <Checkbox
          checked={selected.includes(row.mac)}
          onChange={(e) => handleClick(e, row.mac)}
        />
      }
    },{
      key: 'apName',
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'apName',
      searchable: true,
      sorter: { compare: sortProp('apName', defaultSort) }
    },{
      key: 'rssi',
      title: $t({ defaultMessage: 'Signal' }),
      dataIndex: 'rssi',
      sorter: { compare: sortProp('rssi', defaultSort) },
      render: function (_, row) {
        return (<WifiSignal
          snr={row?.rssi}
          text={row?.rssi ? row.rssi + ' dB' : '--'}
        />)
      }
    }
  ]

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      rowKey='mac'
    />
  )
}
