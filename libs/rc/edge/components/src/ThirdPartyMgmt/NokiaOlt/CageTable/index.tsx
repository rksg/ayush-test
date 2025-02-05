import { useState } from 'react'

import { Row, Switch, Button } from 'antd'
import { useIntl }             from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { useGetEdgeCageListQuery }                                 from '@acx-ui/rc/services'
import {
  EdgeNokiaCageData, EdgeNokiaCageStateEnum, getCageStatusConfig
} from '@acx-ui/rc/utils'

import { EdgeNokiaOltStatus } from '../OltStatus'

import { CageDetailsDrawer } from './CageDetailsDrawer'

interface EdgeNokiaCageTableProps {
  venueId: string
  edgeClusterId: string
  oltId: string
}
export const EdgeNokiaCageTable = (props: EdgeNokiaCageTableProps) => {
  const { venueId, edgeClusterId, oltId } = props
  const [visible, setVisible] = useState<boolean>(false)
  const [currentCage, setCurrentCage] = useState<EdgeNokiaCageData | undefined>(undefined)

  const { data, isLoading, isFetching } = useGetEdgeCageListQuery({
    params: { venueId, edgeClusterId, oltId }
  })

  const handleRowClick = (cage: string) => {
    setCurrentCage(data?.find(item => item.name === cage))
    setVisible(true)
  }

  return <><Loader states={[{ isLoading, isFetching }]}>
    <Table
      rowKey='name'
      columns={useColumns(handleRowClick)}
      dataSource={data}
    />
  </Loader>
  <CageDetailsDrawer
    visible={visible}
    setVisible={setVisible}
    oltId={oltId}
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
      key: 'state',
      dataIndex: 'state',
      width: 80,
      render: (_, row) =>
        <Row>
          <EdgeNokiaOltStatus config={getCageStatusConfig()} status={row.state} showText />
        </Row>
    },
    {
      title: $t({ defaultMessage: 'Change State' }),
      key: 'action',
      dataIndex: 'action',
      width: 80,
      align: 'center',
      render: (_, row) => {
        return <Switch
          checked={row.state === EdgeNokiaCageStateEnum.UP}
          // disabled={isUpdating}
          onChange={() => {
            // onChange?.(fieldName, omit(row, 'children'), checked, newSelected)
          }}
        />
      }
    }
  ]

  return columns
}