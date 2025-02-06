import { useState } from 'react'

import { Row, Switch, Button } from 'antd'
import { useIntl }             from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { useGetEdgeCageListQuery, useToggleEdgeCageStateMutation } from '@acx-ui/rc/services'
import {
  EdgeNokiaCageData,
  EdgeNokiaCageStateEnum,
  EdgeNokiaOltData,
  EdgeNokiaOltStatusEnum,
  getCageStatusConfig
} from '@acx-ui/rc/utils'

import { EdgeNokiaOltStatus } from '../OltStatus'

import { CageDetailsDrawer } from './CageDetailsDrawer'

interface EdgeNokiaCageTableProps {
  oltData: EdgeNokiaOltData
}
export const EdgeNokiaCageTable = (props: EdgeNokiaCageTableProps) => {
  const { oltData } = props
  const { venueId, edgeClusterId, serialNumber: oltId } = oltData

  const [visible, setVisible] = useState<boolean>(false)
  const [currentCage, setCurrentCage] = useState<EdgeNokiaCageData | undefined>(undefined)

  const [toggleEdgeCageState, { isLoading: isUpdating }] = useToggleEdgeCageStateMutation()
  const { data, isLoading, isFetching } = useGetEdgeCageListQuery({
    params: { venueId, edgeClusterId, oltId }
  })

  const handleRowClick = (cage: string) => {
    setCurrentCage(data?.find(item => item.name === cage))
    setVisible(true)
  }

  const handleCageStateChange = async (cage: string, checked: boolean) => {
    try {
      const params = { venueId, edgeClusterId, oltId }
      await toggleEdgeCageState({
        params,
        payload: {
          cage,
          state: checked ? EdgeNokiaCageStateEnum.UP : EdgeNokiaCageStateEnum.DOWN
        }
      }).unwrap()
    }catch(error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  const useColumns = () => {
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
            disabled={isUpdating}
            onChange={async (checked) => {
              await handleCageStateChange(row.name, checked)
            }}
          />
        }
      }
    ]

    return columns
  }

  return <><Loader states={[
    { isLoading, isFetching },
    { isLoading: false, isFetching: isUpdating }
  ]}>
    <Table
      rowKey='name'
      columns={useColumns()}
      dataSource={oltData.status === EdgeNokiaOltStatusEnum.ONLINE ? data : []}
    />
  </Loader>
  <CageDetailsDrawer
    visible={visible}
    setVisible={setVisible}
    oltData={oltData}
    currentCage={currentCage}
  />
  </>
}