import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import {
  Persona,
  TableQuery
} from '@acx-ui/rc/utils'

export interface PersonaTableProps extends Omit<TableProps<Persona>, 'columns'>{
  tableQuery?: TableQuery<Persona,
    { keyword: string, groupId: string },
    unknown>
}

export const AssignedSegmentsTable = (props: PersonaTableProps) => {

  const { $t } = useIntl()

  const personaListTableQuery = props.tableQuery
  const tableData = personaListTableQuery?.data?.data ?? []

  const columns = [
    {
      title: $t({ defaultMessage: 'Segment #' }),
      key: 'segments',
      dataIndex: 'vni',
      fixed: 'left' as const
    },
    {
      title: $t({ defaultMessage: 'Persona' }),
      key: 'persona',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'Devices' }),
      key: 'devices',
      dataIndex: 'deviceCount'
    },
    {
      title: $t({ defaultMessage: 'AP' }),
      key: 'ap',
      dataIndex: 'devices'
    },
    {
      title: $t({ defaultMessage: 'Switch' }),
      key: 'switch',
      dataIndex: 'switches'
    },
    {
      title: $t({ defaultMessage: 'Assigned Port' }),
      key: 'port',
      dataIndex: 'ethernetPorts'
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