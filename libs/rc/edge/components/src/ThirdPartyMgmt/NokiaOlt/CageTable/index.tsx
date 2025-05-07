import { useState, useMemo } from 'react'

import { Row, Switch, Button } from 'antd'
import { get, groupBy }        from 'lodash'
import { useIntl }             from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  Tabs
} from '@acx-ui/components'
import { useToggleEdgeCageStateMutation } from '@acx-ui/rc/services'
import {
  EdgeNokiaCageData,
  EdgeNokiaCageStateEnum,
  EdgeNokiaOltData,
  getCageStatusConfig,
  sortProp,
  defaultSort,
  oltLineCardOptions
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

import { EdgeNokiaOltStatus } from '../OltStatus'

import { CageDetailsDrawer } from './CageDetailsDrawer'


interface EdgeNokiaCageTableProps {
  oltData: EdgeNokiaOltData,
  cagesList: EdgeNokiaCageData[] | undefined,
  isLoading: boolean,
  isFetching: boolean
}
export const EdgeNokiaCageTable = (props: EdgeNokiaCageTableProps) => {
  const { $t } = useIntl()

  const { oltData, cagesList: data, isLoading, isFetching } = props
  const { venueId, edgeClusterId, serialNumber: oltId } = oltData

  const [visible, setVisible] = useState<boolean>(false)
  const [currentCage, setCurrentCage] = useState<EdgeNokiaCageData | undefined>(undefined)
  const [selectedLineCard, setSelectedLineCard] = useState<string>(oltLineCardOptions[0].value)

  const [toggleEdgeCageState, { isLoading: isUpdating }] = useToggleEdgeCageStateMutation()

  const groupedLineCardCages = useMemo(() => {
    return groupBy(data, (item: EdgeNokiaCageData) => {
      return item.cage.split('/')[0]
    })
  }, [data])

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

  const columns: TableProps<EdgeNokiaCageData>['columns'] = [
    {
      key: 'cage',
      title: $t({ defaultMessage: 'Cage' }),
      dataIndex: 'cage',
      sorter: { compare: sortProp('cage', defaultSort) } ,
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
      defaultSortOrder: 'descend',
      sorter: { compare: sortProp('state', defaultSort) } ,
      width: 80,
      render: (_, row) =>
        <Row>
          <EdgeNokiaOltStatus config={getCageStatusConfig()} status={row.state} showText />
        </Row>
    },
    {
      key: 'speed',
      title: $t({ defaultMessage: 'Speed' }),
      dataIndex: 'speed',
      width: 80,
      render: (_, row) => row.state === EdgeNokiaCageStateEnum.UP
        ? `${get(row, 'speed')} Gbps`
        : noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'Change State' }),
      key: 'action',
      dataIndex: 'action',
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


  return <>
    <Loader states={[
      { isLoading, isFetching },
      { isLoading: false, isFetching: isUpdating }
    ]}
    style={{ minHeight: '100px', backgroundColor: 'transparent' }}
    >
      <Tabs type='third'
        activeKey={selectedLineCard}
        onChange={(val) => {
          setSelectedLineCard(val)
        }}>
        {oltLineCardOptions.map((item) => {
          return <Tabs.TabPane tab={item.label} key={item.value} >
            <Table
              rowKey='cage'
              columns={columns}
              // for resolving flashing issue while doing tab switch
              style={{ minHeight: '300px' }}
              dataSource={get(groupedLineCardCages, item.value)}
            />
          </Tabs.TabPane>
        })}
      </Tabs>

    </Loader>
    <CageDetailsDrawer
      visible={visible}
      setVisible={setVisible}
      oltData={oltData}
      currentCage={currentCage}
    />
  </>
}