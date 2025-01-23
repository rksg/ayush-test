import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import {
  EdgeNokiaOnuPortData
} from '@acx-ui/rc/utils'

import { EdgeNokiaOltStatus } from '../OltStatus'

import { TextInlineEditor } from './TextInlineEditor'

const settingsId = 'edge-nokia-onu-ports-table'
export function EdgeNokiaOnuPortTable () {

  return <Loader states={[{ isLoading, isFetching }]}>
    <Table
      rowKey='id'
      settingsId={settingsId}
      columns={useColumns()}
      dataSource={data}
    />
  </Loader>
}

function useColumns () {
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
      align: 'center',
      render: (_, row) =>
        <Row justify='center'>
          <EdgeNokiaOltStatus status={row.status} />
        </Row>
    },
    {
      key: 'poeUtilization',
      title: $t({ defaultMessage: 'PoE Utilization' }),
      dataIndex: 'poeUtilization',
      render: (_, row) => ''//row.poeUtilization
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN ID' }),
      dataIndex: 'vlan',
      render: (_, row) => {
        return <TextInlineEditor value={row.vlan}/>
      }
    }
  ]

  return columns
}