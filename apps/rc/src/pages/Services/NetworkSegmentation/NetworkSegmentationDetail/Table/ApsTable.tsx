import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import {
  APExtended,
  RequestPayload,
  TableQuery
} from '@acx-ui/rc/utils'

export const defaultApPayload = {
  fields: [
    'name', 'model', 'apMac', 'apStatusData.lanPortStatus'
  ]
}

export interface ApTableProps extends Omit<TableProps<APExtended>, 'columns'> {
  tableQuery?: TableQuery<APExtended, RequestPayload<unknown>, unknown>
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
      fixed: 'left' as const
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model'
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      key: 'apMac',
      dataIndex: 'apMac'
    },
    {
      title: $t({ defaultMessage: 'Available Ports' }),
      key: 'ports',
      dataIndex: 'apStatusData.lanPortStatus',
      render: (node, row) => {
        return row?.apStatusData?.lanPortStatus?.length
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
