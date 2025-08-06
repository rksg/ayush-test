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
import { OltOnu }      from '@acx-ui/olt/utils'
import {
  getOltPoeClassText
} from '@acx-ui/rc/utils'

import { GreenPercentageBar } from './styledComponents'

interface OnuTableProps {
  data: OltOnu[] | undefined
  cageName: string | undefined
  onClickRow: (onu: OltOnu | undefined) => void
  onClearSelection: () => void
}

export function OnuTable (props: OnuTableProps) {
  const { data, cageName, onClickRow, onClearSelection } = props
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // eslint-disable-next-line max-len
  const handleRowSelectChange = (selectedRowKeys: AntdTableKeyType[], selectedRows: OltOnu[]) => {
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

function useColumns (props: OnuTableProps) {
  const { $t } = useIntl()
  const columns: TableProps<OltOnu>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'ONU/ONT Name' }),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left',
      render: (_, row) =>
        <Button type='link' size='small' onClick={() => props.onClickRow(row)}>
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