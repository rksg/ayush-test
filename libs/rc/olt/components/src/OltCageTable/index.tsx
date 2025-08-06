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
import { Olt, OltCage, OltCageStateEnum } from '@acx-ui/olt/utils'
import {
  sortProp,
  defaultSort,
  oltLineCardOptions
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

import { OltStatus } from '../OltStatus'

import { CageDetailsDrawer } from './CageDetailsDrawer'


interface OltCageTableProps {
  oltDetails: Olt,
  oltCages: OltCage[] | undefined,
  isLoading: boolean,
  isFetching: boolean
}
export const OltCageTable = (props: OltCageTableProps) => {
  const { $t } = useIntl()

  const { oltDetails, oltCages: data, isLoading, isFetching } = props
  // const { venueId, edgeClusterId, serialNumber: oltId } = oltDetails

  const [visible, setVisible] = useState<boolean>(false)
  const [currentCage, setCurrentCage] = useState<OltCage | undefined>(undefined)
  const [selectedLineCard, setSelectedLineCard] = useState<string>(oltLineCardOptions[0].value)

  const groupedLineCardCages = useMemo(() => {
    return groupBy(data, (item: OltCage) => {
      return item.cage.split('/')[0]
    })
  }, [data])

  const handleRowClick = (cage: string) => {
    setCurrentCage(data?.find(item => item.cage === cage))
    setVisible(true)
  }

  const columns: TableProps<OltCage>['columns'] = [
    {
      key: 'cage',
      title: $t({ defaultMessage: 'Cage' }),
      dataIndex: 'cage',
      sorter: { compare: sortProp('cage', defaultSort) } ,
      searchable: true,
      fixed: 'left',
      render: (_, row) =>
        row.state === OltCageStateEnum.UP
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
          <OltStatus type='cage' status={row.state} showText />
        </Row>
    },
    {
      key: 'speed',
      title: $t({ defaultMessage: 'Speed' }),
      dataIndex: 'speed',
      width: 80,
      render: (_, row) => row.state === OltCageStateEnum.UP
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
          checked={row.state === OltCageStateEnum.UP}
        />
      }
    }
  ]


  return <>
    <Loader states={[
      { isLoading, isFetching }
      // { isLoading: false, isFetching: isUpdating }
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
      oltDetails={oltDetails}
      currentCage={currentCage}
    />
  </>
}