import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import {
  APExtended,
  APExtendedGrouped,
  ApExtraParams, defaultSort, sortProp,
  TableQuery
} from '@acx-ui/rc/utils'

export const defaultApPayload = {
  fields: [
    'name', 'model', 'apMac', 'apStatusData.lanPortStatus', 'apStatusData.vxlanStatus.vxlanMtu'
  ],
  pageSize: 10000
}

export interface ApTableProps extends Omit<TableProps<APExtended>, 'columns'> {
  tableQuery?: TableQuery<APExtended | APExtendedGrouped,
  { filters: { venueId: string[]; }; fields: string[]; pageSize : number },
  ApExtraParams>
}

export const ApsTable = (props: ApTableProps) => {

  const { $t } = useIntl()

  const apListTableQuery = props.tableQuery
  const tableData = apListTableQuery?.data?.data ?? []

  const columns : TableProps<APExtended>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      fixed: 'left' as const
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model',
      sorter: { compare: sortProp('model', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      key: 'apMac',
      dataIndex: 'apMac',
      sorter: { compare: sortProp('apMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Available Ports' }),
      key: 'ports',
      dataIndex: 'apStatusData.lanPortStatus',
      sorter: { compare: sortProp('apStatusData.lanPortStatus', defaultSort) },
      render: (node, row) => {
        return row?.apStatusData?.lanPortStatus?.length
      }
    },
    {
      title: $t({ defaultMessage: 'VxLAN PMTU Value' }),
      key: 'vxlanMtu',
      dataIndex: 'apStatusData.vxlanStatus.vxlanMtu',
      sorter: { compare: sortProp('apStatusData.vxlanStatus.vxlanMtu', defaultSort) },
      render: (node, row) => {
        return row?.apStatusData?.vxlanStatus?.vxlanMtu
      }
    }
  ]

  return (
    <Loader>
      <Table
        columns={columns}
        rowKey='serialNumber'
        dataSource={tableData}
      />
    </Loader>
  )
}
