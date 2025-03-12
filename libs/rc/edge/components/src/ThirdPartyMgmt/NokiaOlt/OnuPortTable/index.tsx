import { Row }     from 'antd'
import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  defaultRichTextFormatValues
} from '@acx-ui/components'
import { formatter }                                                                                                       from '@acx-ui/formatter'
import { useSetEdgeOnuPortVlanMutation }                                                                                   from '@acx-ui/rc/services'
import {  EdgeNokiaCageStateEnum, EdgeNokiaOltData, EdgeNokiaOnuPortData, getOnuPortStatusConfig, OLT_PSE_SUPPLIED_POWER } from '@acx-ui/rc/utils'
import { noDataDisplay }                                                                                                   from '@acx-ui/utils'

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

  const handleVlanIdChange = async (portIdx: string, vlan: number) => {
    return await updateVlan({
      params: {
        venueId: oltData.venueId,
        edgeClusterId: oltData.edgeClusterId,
        oltId: oltData.serialNumber
      },
      payload: {
        cageId: cageName,
        name: onuName,
        toUpdatePortIdx: portIdx,
        toUpdateVlan: vlan.toString()
      }
    }).unwrap()
  }

  return <Table
    rowKey='portIdx'
    columns={useColumns(onuName, handleVlanIdChange)}
    dataSource={data}
  />
}

// eslint-disable-next-line max-len
function useColumns (onuName: string | undefined, handleVlanIdChange: (portIdx: string, value: number) => void) {
  const { $t } = useIntl()
  const columns: TableProps<EdgeNokiaOnuPortData>['columns'] = [
    {
      key: 'portIdx',
      title: $t({ defaultMessage: 'Port' }),
      dataIndex: 'portIdx',
      fixed: 'left',
      width: 40
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'stauts',
      width: 60,
      render: (_, row) => {
        return <Row>
          <EdgeNokiaOltStatus config={getOnuPortStatusConfig()} status={row.status} showText />
        </Row>
      }
    },
    {
      key: 'poeUtilization',
      title: $t({ defaultMessage: 'PoE Utilization' }),
      dataIndex: 'poeUtilization',
      render: (_, row) => {
        const percentVal = row.poePower / OLT_PSE_SUPPLIED_POWER
        // eslint-disable-next-line max-len
        return `${formatter('percentFormat')(percentVal)} (${formatter('ratioFormat')([row.poePower, OLT_PSE_SUPPLIED_POWER])} W)`
      }
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN ID' }),
      dataIndex: 'vlan',
      width: 120,
      align: 'center' as const,
      render: (_, row) => {
        return <TextInlineEditor
          key={`${onuName}-${row.portIdx}`}
          value={stringToNumber(row.vlan[0])}
          onChange={async (vlan) => handleVlanIdChange(row.portIdx, vlan)}
        />
      }
    },
    {
      key: 'clientCount',
      title: $t({ defaultMessage: 'Client<br></br>Count' }, defaultRichTextFormatValues),
      dataIndex: 'clientCount',
      width: 50,
      align: 'center' as const,
      render: (_, row) => {
        // eslint-disable-next-line max-len
        return row.status === EdgeNokiaCageStateEnum.UP ? get(row, 'clientCount') : noDataDisplay
      }
    }
  ]

  return columns
}

/**
 * Converts a string to a number.
 * @param value The string to convert.
 * @returns The numeric value of the string, or 0 if the string is not a valid number.
 */
const stringToNumber = (value?: string): number => value ? (+value || 0) : 0