import { useContext, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import {
  useGetDhcpPoolsQuery,
  useDeleteDhcpServersMutation,
  useUpdateDhcpServerMutation,
  useCreateDhcpServerMutation
} from '@acx-ui/rc/services'
import { isOperationalSwitch } from '@acx-ui/rc/switch/utils'
import {
  useTableQuery,
  SwitchDhcp,
  VenueMessages,
  SwitchRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'
import { SwitchScopes }                  from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { getOpsApi }                     from '@acx-ui/utils'

import { SwitchDetailsContext } from '..'

import { AddPoolDrawer } from './AddPoolDrawer'

export function SwitchDhcpPoolTable () {
  const { $t } = useIntl()
  const params = useParams()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const [ createDhcpServer, { isLoading: isCreating } ] = useCreateDhcpServerMutation()
  const [ updateDhcpServer, { isLoading: isUpdating } ] = useUpdateDhcpServerMutation()
  const [ deleteDhcpServers ] = useDeleteDhcpServersMutation()

  const { switchDetailsContextData } = useContext(SwitchDetailsContext)
  const { switchDetailHeader: switchDetail } = switchDetailsContextData

  const tableQuery = useTableQuery({
    useQuery: useGetDhcpPoolsQuery,
    defaultPayload: {},
    apiParams: { venueId: switchDetail?.venueId },
    sorter: {
      sortField: 'poolName',
      sortOrder: 'DESC'
    },
    enableRbac: isSwitchRbacEnabled,
    option: {
      skip: !switchDetail?.venueId
    }
  })

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selected, setSelected] = useState<SwitchDhcp['id']>()

  const isOperational = switchDetail?.deviceStatus ?
    isOperationalSwitch(switchDetail?.deviceStatus, switchDetail.syncedSwitchConfig) : false

  const isSelectionVisible = !switchDetail?.cliApplied && hasPermission({
    scopes: [SwitchScopes.UPDATE, SwitchScopes.DELETE],
    rbacOpsIds: [
      getOpsApi(SwitchRbacUrlsInfo.updateDhcpServer),
      getOpsApi(SwitchRbacUrlsInfo.deleteDhcpServers)
    ]
  })

  const handleSavePool = async (values: SwitchDhcp) => {
    try {
      if (selected) { // Edit
        await updateDhcpServer({
          params: {
            ...params,
            venueId: switchDetail?.venueId,
            dhcpServerId: selected
          },
          payload: values,
          enableRbac: isSwitchRbacEnabled
        }).unwrap()
      } else { // Add
        await createDhcpServer({
          params: {
            ...params,
            venueId: switchDetail?.venueId
          },
          payload: values,
          enableRbac: isSwitchRbacEnabled
        }).unwrap()
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
    scopeKey: [SwitchScopes.UPDATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateDhcpServer)],
    visible: (selectedRows) => selectedRows.length === 1,
    onClick: (selectedRows) => {
      setSelected(selectedRows[0].id)
      setDrawerVisible(true)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    scopeKey: [SwitchScopes.DELETE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.deleteDhcpServers)],
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
          deleteDhcpServers({
            params: {
              ...params,
              venueId: switchDetail?.venueId
            },
            payload: selectedRows.map(r => r.id),
            enableRbac: isSwitchRbacEnabled
          })
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
          scopeKey: [SwitchScopes.CREATE],
          rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addDhcpServer)],
          disabled: !isOperational || !!switchDetail?.cliApplied,
          tooltip: !!switchDetail?.cliApplied ? $t(VenueMessages.CLI_APPLIED) : '',
          onClick: () => {
            setSelected(undefined)
            setDrawerVisible(true)
          }
        }])}
        rowKey='id'
        rowActions={!!switchDetail?.cliApplied ? undefined : filterByAccess(rowActions)}
        rowSelection={isSelectionVisible
          ? { type: 'checkbox' }
          : undefined
        }
      />
      <AddPoolDrawer
        visible={drawerVisible}
        isLoading={isCreating || isUpdating}
        editPoolId={selected}
        venueId={switchDetail?.venueId}
        onSavePool={handleSavePool}
        onClose={()=>setDrawerVisible(false)}
      />
    </Loader>
  )
}
