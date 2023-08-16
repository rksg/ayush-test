import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  useSwitchDetailHeaderQuery,
  useGetDhcpPoolsQuery,
  useDeleteDhcpServersMutation,
  useUpdateDhcpServerMutation,
  useCreateDhcpServerMutation
} from '@acx-ui/rc/services'
import {
  useTableQuery,
  SwitchDhcp,
  isOperationalSwitch,
  VenueMessages
} from '@acx-ui/rc/utils'
import { useParams }                 from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { AddPoolDrawer } from './AddPoolDrawer'

export function SwitchDhcpPoolTable () {
  const { $t } = useIntl()
  const params = useParams()
  const { data: switchDetail } = useSwitchDetailHeaderQuery({ params })
  const [ createDhcpServer, { isLoading: isCreating } ] = useCreateDhcpServerMutation()
  const [ updateDhcpServer, { isLoading: isUpdating } ] = useUpdateDhcpServerMutation()
  const [ deleteDhcpServers ] = useDeleteDhcpServersMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetDhcpPoolsQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'poolName',
      sortOrder: 'DESC'
    }
  })

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selected, setSelected] = useState<SwitchDhcp['id']>()

  const isOperational = switchDetail?.deviceStatus ?
    isOperationalSwitch(switchDetail?.deviceStatus, switchDetail.syncedSwitchConfig) : false

  const handleSavePool = async (values: SwitchDhcp) => {
    try {
      if (selected) { // Edit
        await updateDhcpServer({ params, payload: values }).unwrap()
      } else { // Add
        await createDhcpServer({ params, payload: values }).unwrap()
      }
      setSelected(undefined)
      setDrawerVisible(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const columns: TableProps<SwitchDhcp>['columns'] = [
    {
      key: 'poolName',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'poolName',
      sorter: true,
      defaultSortOrder: 'ascend'
    }, {
      key: 'subnetAddress',
      title: $t({ defaultMessage: 'Address Pool' }),
      dataIndex: 'subnetAddress',
      sorter: true
    }, {
      key: 'subnetMask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnetMask',
      sorter: true
    }, {
      key: 'leaseDays',
      title: $t({ defaultMessage: 'Lease Time' }),
      dataIndex: 'leaseDays',
      sorter: false,
      render: (_, row) => {
        return $t({ defaultMessage: `
          { leaseDays, plural, =0 {} one {{leaseDays} day} other {{leaseDays} days}}
          { leaseHrs, plural, =0 {} one {{leaseHrs} hr} other {{leaseHrs} hrs}}
          { leaseMins, plural, =0 {} one {{leaseMins} min} other {{leaseMins} mins}}
        ` }, {
          leaseDays: row.leaseDays,
          leaseHrs: row.leaseHrs,
          leaseMins: row.leaseMins
        })
      }
    }, {
      key: 'defaultRouterIp',
      title: $t({ defaultMessage: 'Default Router IP' }),
      dataIndex: 'defaultRouterIp',
      sorter: true
    }
  ]

  const rowActions: TableProps<SwitchDhcp>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (selectedRows) => selectedRows.length === 1,
    onClick: (selectedRows) => {
      setSelected(selectedRows[0].id)
      setDrawerVisible(true)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Pool' }),
          entityValue: selectedRows[0].poolName,
          numOfEntities: selectedRows.length
        },
        onOk: () => {
          deleteDhcpServers({ params, payload: selectedRows.map(r => r.id) })
          clearSelection()
        }
      })
    }
  }]

  return (
    <Loader states={[tableQuery]}>
      <Table columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        actions={filterByAccess([{
          label: $t({ defaultMessage: 'Add Pool' }),
          disabled: !isOperational || !!switchDetail?.cliApplied,
          tooltip: !!switchDetail?.cliApplied ? $t(VenueMessages.CLI_APPLIED) : '',
          onClick: () => {
            setSelected(undefined)
            setDrawerVisible(true)
          }
        }])}
        rowKey='id'
        rowActions={!!switchDetail?.cliApplied ? undefined : filterByAccess(rowActions)}
        rowSelection={!!switchDetail?.cliApplied || !hasAccess()
          ? undefined
          : { type: 'checkbox' }}
      />
      <AddPoolDrawer
        visible={drawerVisible}
        isLoading={isCreating || isUpdating}
        editPoolId={selected}
        onSavePool={handleSavePool}
        onClose={()=>setDrawerVisible(false)}
      />
    </Loader>
  )
}
