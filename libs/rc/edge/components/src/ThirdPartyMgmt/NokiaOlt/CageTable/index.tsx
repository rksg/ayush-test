import { useState } from 'react'

import { Row, Switch, Button } from 'antd'
import { useIntl }             from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { useToggleEdgeCageStateMutation } from '@acx-ui/rc/services'
import {
  EdgeNokiaCageData,
  EdgeNokiaCageStateEnum,
  EdgeNokiaOltData,
  getCageStatusConfig
} from '@acx-ui/rc/utils'

import { EdgeNokiaOltStatus } from '../OltStatus'

import { CageDetailsDrawer } from './CageDetailsDrawer'

interface EdgeNokiaCageTableProps {
  oltData: EdgeNokiaOltData,
  cagesList: EdgeNokiaCageData[] | undefined,
  isLoading: boolean,
  isFetching: boolean
}
export const EdgeNokiaCageTable = (props: EdgeNokiaCageTableProps) => {
  const { oltData, cagesList: data, isLoading, isFetching } = props
  const { venueId, edgeClusterId, serialNumber: oltId } = oltData

  const [visible, setVisible] = useState<boolean>(false)
  const [currentCage, setCurrentCage] = useState<EdgeNokiaCageData | undefined>(undefined)

  const [toggleEdgeCageState, { isLoading: isUpdating }] = useToggleEdgeCageStateMutation()

  const handleRowClick = (cage: string) => {
    setCurrentCage(data?.find(item => item.cage === cage))
    setVisible(true)
  }

  const handleCageStateChange = async (cage: string, checked: boolean) => {
    try {
      const params = { venueId, edgeClusterId, oltId }
      await toggleEdgeCageState({
        params,
        payload: {
          cage,
          state: checked ? 'UP' : 'DOWN'
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
        key: 'cage',
        title: $t({ defaultMessage: 'Cage' }),
        dataIndex: 'cage',
        sorter: true,
        searchable: true,
        fixed: 'left',
        render: (_, row) =>
          row.state === EdgeNokiaCageStateEnum.UP
            ? <Button type='link' onClick={() => handleRowClick(row.cage)}>
              {row.cage}
            </Button>
            : row.cage
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
              await handleCageStateChange(row.cage, checked)
            }}
          />
        }
      }
    ]

    return columns
  }

  return <>
    <Loader states={[
      { isLoading, isFetching },
      { isLoading: false, isFetching: isUpdating }
    ]}
    style={{ minHeight: '100px', backgroundColor: 'transparent' }}
    >
      <Table
        rowKey='cage'
        columns={useColumns()}
        dataSource={data}
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