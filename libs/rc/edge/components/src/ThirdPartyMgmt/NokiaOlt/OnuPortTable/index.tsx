import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import { useSetEdgeOnuPortVlanMutation }                                   from '@acx-ui/rc/services'
import {  EdgeNokiaOltData, EdgeNokiaOnuPortData, getOnuPortStatusConfig } from '@acx-ui/rc/utils'

import { EdgeNokiaOltStatus } from '../OltStatus'

import { TextInlineEditor } from './TextInlineEditor'

interface EdgeNokiaOnuPortTableProps {
  data: EdgeNokiaOnuPortData[] | undefined
  oltData: EdgeNokiaOltData
  cageName: string | undefined
  onuName: string | undefined
}

export const EdgeNokiaOnuPortTable = (props: EdgeNokiaOnuPortTableProps) => {
  const { data, oltData, cageName, onuName } = props

  const [updateVlan] = useSetEdgeOnuPortVlanMutation()
  const handleVlanIdChange = async (portId: string, vlan: number) => {
    return await updateVlan({
      params: {
        venueId: oltData.venueId,
        edgeClusterId: oltData.edgeClusterId,
        oltId: oltData.serialNumber
      },
      payload: {
        cageId: cageName,
        name: onuName,
        ports: portId,
        toUpdateVlan: vlan.toString()
      }
    }).unwrap()
  }

  return <Table
    rowKey='portId'
    columns={useColumns(onuName, handleVlanIdChange)}
    dataSource={data?.map((item, idx) => ({ ...item, portId: `${idx}` }))}
  />
}

// eslint-disable-next-line max-len
function useColumns (onuName: string | undefined, handleVlanIdChange: (portId: string, value: number) => void) {
  const { $t } = useIntl()
  const columns: TableProps<EdgeNokiaOnuPortData>['columns'] = [
    {
      key: 'portId',
      title: $t({ defaultMessage: 'Port' }),
      dataIndex: 'portId',
      fixed: 'left',
      width: 50
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
          key={`${onuName}-${row.portId}`}
          value={stringToNumber(row.vlan[0])}
          onChange={async (vlan) => handleVlanIdChange(row.portId, vlan)}
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