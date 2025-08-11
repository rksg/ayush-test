import { useState, useMemo } from 'react'

import { get, groupBy } from 'lodash'
import { useIntl }      from 'react-intl'

import { Table, TableProps, Loader, Tabs }                    from '@acx-ui/components'
import { Olt, OltCage, OltCageStateEnum, oltLineCardOptions } from '@acx-ui/olt/utils'
import { sortProp, defaultSort }                              from '@acx-ui/rc/utils'
import { TenantLink }                                         from '@acx-ui/react-router-dom'
import { filterByAccess }                                     from '@acx-ui/user'
import { noDataDisplay }                                      from '@acx-ui/utils'

import { OltStatus } from '../OltStatus'
interface OltCageTableProps {
  oltDetails: Olt,
  oltCages: OltCage[] | undefined,
  isLoading: boolean,
  isFetching: boolean
}
export const OltCageTable = (props: OltCageTableProps) => {
  const { $t } = useIntl()
  const { oltDetails, oltCages: data, isLoading, isFetching } = props

  const [activeKey, setActiveKey] = useState<string>(oltLineCardOptions[0].value)

  const groupedLineCardCages = useMemo(() => {
    return groupBy(data, (item: OltCage) => {
      return item.cage.split('/')[0]
    })
  }, [data])

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
          // eslint-disable-next-line max-len
          ? <TenantLink to={`/devices/optical/${oltDetails.serialNumber}/cages/${row.cage.replace('/', '-')}`}>
            {row.cage}
          </TenantLink>
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

  const handleTabChange = (val: string) => {
    setActiveKey(val)
  }

  return <Loader
    states={[{ isLoading, isFetching }]}
    style={{ minHeight: '100px', backgroundColor: 'transparent' }}
  >
    <Tabs
      type='third'
      activeKey={activeKey}
      onChange={handleTabChange}>
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
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Manage ONT S/N' })
              // onClick: () => { setOntDrawerVisible(true) }
            }, {
              label: $t({ defaultMessage: 'Manage Cage Group' })
              // onClick: () => { setCageGroupDrawerVisible(true) }
            }])}
          />
        </Tabs.TabPane>
      })}
    </Tabs>
  </Loader>
}