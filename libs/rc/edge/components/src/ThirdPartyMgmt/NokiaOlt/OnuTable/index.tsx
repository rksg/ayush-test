import { useEffect, useState } from 'react'

import { Space }                   from 'antd'
import { Key as AntdTableKeyType } from 'antd/lib/table/interface'
import { useIntl }                 from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  Button,
  ProgressBarV2
} from '@acx-ui/components'
import { useGetEdgeOnuListQuery } from '@acx-ui/rc/services'
import {
  EdgeNokiaOltData,
  EdgeNokiaOnuData,
  getOltPoeClassText
} from '@acx-ui/rc/utils'

interface EdgeNokiaOnuTableProps {
  oltData: EdgeNokiaOltData | undefined
  cageName: string | undefined
  onClick: (onu: EdgeNokiaOnuData | undefined) => void
}

export function EdgeNokiaOnuTable (props: EdgeNokiaOnuTableProps) {
  const { oltData, cageName } = props
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const { data, isLoading, isFetching } = useGetEdgeOnuListQuery({
    params: {
      venueId: oltData?.venueId,
      edgeClusterId: oltData?.edgeClusterId,
      oltId: oltData?.serialNumber
    },
    payload: { cageId: cageName }
  }, { skip: !oltData || !cageName })

  // eslint-disable-next-line max-len
  const handleRowSelectChange = (selectedRowKeys: AntdTableKeyType[], selectedRows: EdgeNokiaOnuData[]) => {
    setSelectedRowKeys(selectedRowKeys)
    props.onClick(selectedRowKeys.length === 0 ? undefined : selectedRows[0])
  }

  const clearSelection = () => {
    setSelectedRowKeys([])
    props.onClick(undefined)
  }

  useEffect(() => {
    clearSelection()
  }, [cageName])

  return <Loader
    states={[{ isLoading, isFetching }]}
    style={{ minHeight: '100px', backgroundColor: 'transparent' }}
  >
    <Table
      rowKey='name'
      columns={useColumns(props)}
      dataSource={data}
      rowSelection={{
        type: 'radio',
        onChange: handleRowSelectChange,
        selectedRowKeys
      }}
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
          <div style={{ margin: 'auto', width: '100px' }}>
            <ProgressBarV2 percent={(row.usedPorts/row.ports) * 100} />
          </div>
        </Space>
    },
    {
      key: 'poeClass',
      title: $t({ defaultMessage: 'PoE Class' }),
      dataIndex: 'poeClass',
      render: (_, row) => getOltPoeClassText(row.poeClass)
    }
  ]

  return columns
}