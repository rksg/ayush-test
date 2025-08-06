import { useState, useMemo } from 'react'

import { Button }       from 'antd'
import { get, groupBy } from 'lodash'
import { useIntl }      from 'react-intl'

import { Table, TableProps, Loader, Tabs }                    from '@acx-ui/components'
import { Olt, OltCage, OltCageStateEnum, oltLineCardOptions } from '@acx-ui/olt/utils'
import { sortProp, defaultSort }                              from '@acx-ui/rc/utils'
import { filterByAccess }                                     from '@acx-ui/user'
import { noDataDisplay }                                      from '@acx-ui/utils'

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
          ? <Button type='link' size='small' onClick={() => handleRowClick(row.cage)}>
            {row.cage}
          </Button>
          : row.cage
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'state',
      dataIndex: 'state',
      defaultSortOrder: 'descend',
      sorter: { compare: sortProp('state', defaultSort) },
      // filterable: true,
      width: 80,
      render: (_, row) =>
        <OltStatus type='cage' status={row.state} showText />
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      key: 'speed',
      dataIndex: 'speed',
      width: 80,
      render: (_, row) => row.state === OltCageStateEnum.UP
        ? `${get(row, 'speed')} Gbps`
        : noDataDisplay
    }
  ]

  const rowActions: TableProps<OltCage>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      // rbacOpsIds: ,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClick: (rows) => {
      }
    }
  ]

  return <>
    <Loader
      states={[{ isLoading, isFetching }]}
      style={{ minHeight: '100px', backgroundColor: 'transparent' }}
    >
      <Tabs
        type='third'
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
              rowActions={filterByAccess(rowActions)}
              rowSelection={{ type: 'checkbox' }}
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