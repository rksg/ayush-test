import { useEffect, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Table }                                      from '@acx-ui/components'
import { EdgePortInfo, EdgeStatus, getIpWithBitMask } from '@acx-ui/rc/utils'

interface InterfaceTableProps {
  nodeList?: EdgeStatus[]
  selectedInterface?: { [key: string]: EdgePortInfo | undefined }
}

interface InterfaceTableDataType {
  nodeName: string
  interface: string
  ip: string
}

export const InterfaceTable = (props: InterfaceTableProps) => {
  const { nodeList, selectedInterface } = props
  const { $t } = useIntl()
  const [data, setData] = useState<InterfaceTableDataType[]>([])

  useEffect(() => {
    if(!nodeList || !selectedInterface) return
    setData(nodeList.map(node => {
      const target = selectedInterface[node.serialNumber]
      return {
        nodeName: node.name,
        interface: _.capitalize(target?.portName),
        ip: getIpWithBitMask(target?.ip, target?.subnet)
      }
    }))
  }, [nodeList, selectedInterface])

  const columns = [
    {
      title: $t({ defaultMessage: 'Node Name' }),
      key: 'nodeName',
      dataIndex: 'nodeName'
    },
    {
      title: $t({ defaultMessage: 'Interface' }),
      key: 'interface',
      dataIndex: 'interface'
    },
    {
      title: $t({ defaultMessage: 'IP Subnet' }),
      key: 'ip',
      dataIndex: 'ip'
    }
  ]

  return (
    <Table
      type='form'
      rowKey='nodeName'
      columns={columns}
      dataSource={data}
    />
  )
}