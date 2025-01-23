import { useState } from 'react'

import { Row, Switch } from 'antd'
import { useIntl }     from 'react-intl'

import {
  Table,
  TableProps,
  Loader } from '@acx-ui/components'
import {
  EdgeNokiaCageData
} from '@acx-ui/rc/utils'

import { CageDetailsDrawer } from './CageDetailDrawer'

const settingsId = 'edge-nokia-olt-cage-table'
export const EdgeNokiaCageTable = () => {
  const [visible, setVisible] = useState<boolean>(false)
  const [currentCage, setCurrentCage] = useState<EdgeNokiaCageData | undefined>(undefined)

  const handleRowClick = (cage: string) => {
    setCurrentCage(data.find(item => item.id === cage))
  }

  return <><Loader states={[{ isLoading, isFetching }]}>
    <Table
      rowKey='id'
      settingsId={settingsId}
      columns={useColumns(handleRowClick)}
      dataSource={data}
    />
  </Loader>
  <CageDetailsDrawer
    visible={visible}
    setVisible={setVisible}
    currentCage={currentCage}
  />
  </>
}

function useColumns (handleRowClick: (cageId: string) => void) {
  const { $t } = useIntl()
  const columns: TableProps<EdgeNokiaCageData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Cage' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: (_, row) =>
        <Button type='link' onClick={() => handleRowClick(row.name)}>
          {row.name}
        </Button>
    },
    {
      title: $t({ defaultMessage: 'State' }),
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
      title: $t({ defaultMessage: 'Change State' }),
      key: 'edgeClusterId',
      dataIndex: 'edgeClusterId',
      width: 80,
      align: 'center',
      render: (_, row) => {
        return <Switch
          checked={row.state === EdgeNokiaCageStateEnum.UP}
          // disabled={isUpdating}
          onChange={(checked: boolean) => {
            onChange?.(fieldName, omit(row, 'children'), checked, newSelected)
          }}
        />
      }
    }
  ]

  return columns
}