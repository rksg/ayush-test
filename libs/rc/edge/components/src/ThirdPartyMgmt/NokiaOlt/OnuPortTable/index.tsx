import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import {  EdgeNokiaOnuPortData, getOnuPortStatusConfig } from '@acx-ui/rc/utils'

import { EdgeNokiaOltStatus } from '../OltStatus'

import { TextInlineEditor } from './TextInlineEditor'

interface EdgeNokiaOnuPortTableProps {
  data: EdgeNokiaOnuPortData[] | undefined
}

export const EdgeNokiaOnuPortTable = (props: EdgeNokiaOnuPortTableProps) => {
  const { data } = props

  const handleVlanIdChange = () => {}

  return <Table
    rowKey='portId'
    columns={useColumns(handleVlanIdChange)}
    dataSource={data}
  />
}

function useColumns (handleVlanIdChange: (portId: string, value: number) => void) {
  const { $t } = useIntl()
  const columns: TableProps<EdgeNokiaOnuPortData>['columns'] = [
    {
      key: 'portId',
      title: $t({ defaultMessage: 'Port' }),
      dataIndex: 'portId',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'stauts',
      width: 80,
      render: (_, row) => {
        return <Row>
          <EdgeNokiaOltStatus config={getOnuPortStatusConfig()} status={row.status} showText />
        </Row>
      }
    },
    {
      key: 'poeUtilization',
      title: $t({ defaultMessage: 'PoE Utilization' }),
      dataIndex: 'poeUtilization'
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN ID' }),
      dataIndex: 'vlan',
      render: (_, row) => {
        return <TextInlineEditor
          value={stringToNumber(row.vlan[0])}
          onChange={vlan => handleVlanIdChange(row.portId, vlan)}
        />
      }
    }
  ]

  return columns
}

const stringToNumber = (value: string | undefined) => {
  if (!value) return 0

  return isNaN(parseInt(value, 10)) ? 0 : +value
}