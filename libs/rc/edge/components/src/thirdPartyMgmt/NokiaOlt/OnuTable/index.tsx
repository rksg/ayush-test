import {  Space }  from 'antd'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  Button,
  ProgressBarV2
} from '@acx-ui/components'
import {
  EdgeNokiaOnuData
} from '@acx-ui/rc/utils'

import { EdgeNokiaOltStatus } from './OltStatus'

interface EdgeNokiaOnuTableProps {
  onClick: (onuId: string) => void
}

const settingsId = 'edge-nokia-onu-table'
export function EdgeNokiaOnuTable (props: EdgeNokiaOnuTableProps) {
  return <Loader states={[{ isLoading, isFetching }]}>
    <Table
      rowKey='id'
      settingsId={settingsId}
      columns={useColumns(props)}
      dataSource={data}
      rowSelection={{ type: 'radio' }}
    />
  </Loader>
}

function useColumns (props: EdgeNokiaOnuTableProps) {
  const { $t } = useIntl()
  const columns: TableProps<EdgeNokiaOnuData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'ONU Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: (_, row) =>
        <Button type='link' onClick={() => props.onClick(row.id)}>
          {row.name}
        </Button>
    },
    {
      key: 'ports',
      title: $t({ defaultMessage: 'Ports' }),
      dataIndex: 'ports',
      render: (_, row) =>
        <Space>
          <span>{row.ports}</span>
          <ProgressBarV2 percent={33.33} />
        </Space>
    },
    {
      key: 'poeClass',
      title: $t({ defaultMessage: 'PoE Class' }),
      dataIndex: 'poeClass'
    }
  ]

  return columns
}