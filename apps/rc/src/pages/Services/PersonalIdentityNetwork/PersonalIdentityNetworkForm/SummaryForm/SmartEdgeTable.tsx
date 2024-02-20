
import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'

export interface SmartEdgeTableData {
  edgeName: string
  segments: string
  devices: string
  dhcpServiceName: string
  dhcpPoolName: string
}

interface SmartEdgeTableProps {
  data: SmartEdgeTableData[]
}

export const SmartEdgeTable = (props: SmartEdgeTableProps) => {

  const { $t } = useIntl()

  const columns: TableProps<SmartEdgeTableData>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'edgeName',
      dataIndex: 'edgeName'
    },
    {
      title: $t({ defaultMessage: 'Number of Segments' }),
      key: 'segments',
      dataIndex: 'segments',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Number of devices per Segment' }),
      key: 'devices',
      dataIndex: 'devices',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'DHCP Service' }),
      key: 'dhcpServiceName',
      dataIndex: 'dhcpServiceName'
    },
    {
      title: $t({ defaultMessage: 'DHCP Pool' }),
      key: 'dhcpPoolName',
      dataIndex: 'dhcpPoolName'
    }
  ]

  return (
    <Table rowKey={'edgeName'}
      type='form'
      columns={columns}
      dataSource={props.data}
    />
  )
}
