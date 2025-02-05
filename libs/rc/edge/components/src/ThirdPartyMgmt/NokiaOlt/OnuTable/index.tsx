import {  Space }  from 'antd'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  Button,
  ProgressBarV2
} from '@acx-ui/components'
import { useGetEdgeOnuListQuery } from '@acx-ui/rc/services'
import {
  EdgeNokiaOnuData
} from '@acx-ui/rc/utils'

interface EdgeNokiaOnuTableProps {
  oltId: string | undefined
  cageName: string | undefined
  onClick: (onu: EdgeNokiaOnuData) => void
}

export function EdgeNokiaOnuTable (props: EdgeNokiaOnuTableProps) {
  const { oltId, cageName } = props
  const { data, isLoading } = useGetEdgeOnuListQuery({
    params: { oltId, cageName }
  }, { skip: !oltId || !cageName })

  return <Loader states={[{ isLoading }]}>
    <Table
      rowKey='name'
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
      fixed: 'left',
      render: (_, row) =>
        <Button type='link' onClick={() => props.onClick(row)}>
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