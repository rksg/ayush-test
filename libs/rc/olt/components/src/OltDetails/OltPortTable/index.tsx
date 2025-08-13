import { useState, useMemo } from 'react'

import { get, groupBy } from 'lodash'
import { useIntl }      from 'react-intl'

import { Table, TableProps, Loader, Tabs }                        from '@acx-ui/components'
import { Olt, OltPort, OltPortStatusEnum, oltNetworkCardOptions } from '@acx-ui/olt/utils'
import { sortProp, defaultSort }                                  from '@acx-ui/rc/utils'
// import { TenantLink }                                             from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
import { noDataDisplay }  from '@acx-ui/utils'

import { OltStatus }      from '../../OltStatus'
import { EditPortDrawer } from '../EditPortDrawer'
// import { ManageCageGroupDrawer } from '../ManageCageGroupDrawer'
import { ManageLacpLagDrawer } from '../ManageLacpLagDrawer'

interface OltCageTableProps {
  oltDetails: Olt,
  oltPorts: OltPort[] | undefined,
  isLoading: boolean,
  isFetching: boolean
}
export const OltPortTable = (props: OltCageTableProps) => {
  const { $t } = useIntl()
  const { oltPorts: data, isLoading, isFetching } = props

  const [activeKey, setActiveKey] = useState<string>(oltNetworkCardOptions[0].value)
  const [editPortData, setEditPortData] = useState<OltPort | null>(null)
  const [editCageDrawerVisible, setEditPortDrawerVisible] = useState(false)
  const [manageLacpLagDrawerVisible, setManageLacpLagDrawerVisible] = useState(false)
  // const [manageCageGroupDrawerVisible, setManageCageGroupDrawerVisible] = useState(false)

  const groupedLineCardCages = useMemo(() => {
    return groupBy(data, (item: OltPort) => {
      return item.port.split('/')[0]
    })
  }, [data])

  const columns: TableProps<OltPort>['columns'] = [
    {
      key: 'port',
      title: $t({ defaultMessage: 'Port' }),
      dataIndex: 'port',
      sorter: { compare: sortProp('port', defaultSort) } ,
      // searchable: true,
      fixed: 'left',
      render: (_, row) =>
        row.port
        // row.status === OltPortStatusEnum.UP
        //   // eslint-disable-next-line max-len
        //   ? <TenantLink to={`/devices/optical/${oltDetails.serialNumber}/ports/${row.port.replace('/', '-')}`}>
        //     {row.port}
        //   </TenantLink>
        //   : row.port
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      defaultSortOrder: 'descend',
      sorter: { compare: sortProp('status', defaultSort) },
      // filterable: true,
      width: 80,
      render: (_, row) =>
        <OltStatus type='port' status={row.status} showText />
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      key: 'speed',
      dataIndex: 'speed',
      width: 80,
      render: (_, row) => row.status === OltPortStatusEnum.UP
        ? `${get(row, 'speed')} Gb/sec`
        : noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'VLAN ID' }),
      key: 'VLAN_ID',
      dataIndex: 'VLAN_ID',
      width: 80,
      render: (_, row) => row.VLAN_ID
    }
  ]

  const rowActions: TableProps<OltPort>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      // rbacOpsIds: ,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClick: (rows) => { // TODO: edit cage
        setEditPortData(rows[0])
        setEditPortDrawerVisible(true)
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
      {oltNetworkCardOptions.map((item) => {
        return <Tabs.TabPane tab={item.label} key={item.value} >
          <Table
            rowKey='port'
            columns={columns}
            // for resolving flashing issue while doing tab switch
            style={{ minHeight: '300px' }}
            dataSource={get(groupedLineCardCages, item.value)}
            rowActions={filterByAccess(rowActions)}
            rowSelection={{ type: 'checkbox' }}
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Manage LACP LAG' }),
              onClick: () => { setManageLacpLagDrawerVisible(true) }
            }])}
          />
        </Tabs.TabPane>
      })}
    </Tabs>
    <EditPortDrawer
      data={editPortData}
      visible={editCageDrawerVisible}
      setVisible={setEditPortDrawerVisible}
    />
    <ManageLacpLagDrawer
      visible={manageLacpLagDrawerVisible}
      setVisible={setManageLacpLagDrawerVisible}
    />
    {/* <ManageCageGroupDrawer
      visible={manageCageGroupDrawerVisible}
      setVisible={setManageCageGroupDrawerVisible}
    /> */}
  </Loader>
}