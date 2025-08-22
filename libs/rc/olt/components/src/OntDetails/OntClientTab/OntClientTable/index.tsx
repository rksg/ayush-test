import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'
import { OltOntClient }      from '@acx-ui/olt/utils'

interface OntClientTableProps {
  data?: OltOntClient[]
}

export const OntClientTable = (props: OntClientTableProps) => {
  const { data } = props

  return <Table
    rowKey='macAddress'
    columns={useColumns()}
    dataSource={data}
    stickyHeaders={false}
  />
}

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<OltOntClient>['columns'] = [
    {
      key: 'hostname',
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      width: 100,
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Learnt MAC Address' }), //TODO: typo? check with UX
      key: 'macAddress',
      dataIndex: 'macAddress',
      width: 160
    },
    {
      key: 'port',
      title: $t({ defaultMessage: 'ONT Port' }),
      dataIndex: 'port'
    }
  ]

  return columns
}
