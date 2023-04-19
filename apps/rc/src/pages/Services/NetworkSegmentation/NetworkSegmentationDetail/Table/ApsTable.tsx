import { useIntl } from 'react-intl'

import { Loader, Table } from '@acx-ui/components'
import {
  APExtended,
  RequestPayload,
  TableQuery
} from '@acx-ui/rc/utils'

export const defaultApPayload = {
  fields: [
    'name', 'model', 'apMac', 'apStatusData.lanPortStatus.port'
  ]
}

export interface ApTableProps {
  tableQuery?: TableQuery<APExtended, RequestPayload<unknown>, unknown>
}

export const ApsTable = (props: ApTableProps) => {

  const { $t } = useIntl()

  const apListTableQuery = props.tableQuery
  const tableData = apListTableQuery?.data?.data ?? []

  const columns = [
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
      dataIndex: 'ports'
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
