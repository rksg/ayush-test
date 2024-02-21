import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Table }        from '@acx-ui/components'
import { EdgeDhcpPool } from '@acx-ui/rc/utils'

interface DhcpPoolTableProps {
  data?: EdgeDhcpPool
}

interface DhcpPoolTableDataType {
  subnetMask: string
  poolRange: string
}

export const DhcpPoolTable = (props: DhcpPoolTableProps) => {

  const { $t } = useIntl()
  const{ data } = props
  const [tableData, setTableData] = useState<DhcpPoolTableDataType[]>([])

  useEffect(() => {
    if(data) {
      setTableData([{
        subnetMask: data.subnetMask,
        poolRange: `${data.poolStartIp} - ${data.poolEndIp}`
      }])
    }
  }, [data])

  const columns = [
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnetMask',
      dataIndex: 'subnetMask'
    },
    {
      title: $t({ defaultMessage: 'Pool Range' }),
      key: 'poolRange',
      dataIndex: 'poolRange'
    }
  ]

  return (
    <Table
      rowKey='poolRange'
      type='form'
      columns={columns}
      dataSource={tableData}
    />
  )
}