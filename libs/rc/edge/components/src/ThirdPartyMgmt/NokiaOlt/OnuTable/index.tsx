import { useEffect, useState } from 'react'

import { Space }                   from 'antd'
import { Key as AntdTableKeyType } from 'antd/lib/table/interface'
import { useIntl }                 from 'react-intl'

import {
  Table,
  TableProps,
  Button,
  ProgressBarV2
} from '@acx-ui/components'
import {
  EdgeNokiaOnuData,
  getOltPoeClassText
} from '@acx-ui/rc/utils'

import { GreenPercentageBar } from './styledComponents'

interface EdgeNokiaOnuTableProps {
  data: EdgeNokiaOnuData[] | undefined
  cageName: string | undefined
  onClickRow: (onu: EdgeNokiaOnuData | undefined) => void
  onClearSelection: () => void
}

export function EdgeNokiaOnuTable (props: EdgeNokiaOnuTableProps) {
  const { data, cageName, onClickRow, onClearSelection } = props
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // eslint-disable-next-line max-len
  const handleRowSelectChange = (selectedRowKeys: AntdTableKeyType[], selectedRows: EdgeNokiaOnuData[]) => {
    setSelectedRowKeys(selectedRowKeys)
    onClickRow(selectedRowKeys.length === 0 ? undefined : selectedRows[0])
  }

  const clearSelection = () => {
    setSelectedRowKeys([])
    onClearSelection()
  }

  useEffect(() => {
    clearSelection()
  }, [cageName])

  return <Table
    rowKey='name'
    columns={useColumns(props)}
    dataSource={data}
    rowSelection={{
      type: 'radio',
      onChange: handleRowSelectChange,
      selectedRowKeys
    }}
  />
}

function useColumns (props: EdgeNokiaOnuTableProps) {
  const { $t } = useIntl()
  const columns: TableProps<EdgeNokiaOnuData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'ONU/ONT Name' }),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left',
      render: (_, row) =>
        <Button type='link' onClick={() => props.onClickRow(row)}>
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
          <GreenPercentageBar>
            <ProgressBarV2 percent={(row.usedPorts/row.ports) * 100} />
          </GreenPercentageBar>
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