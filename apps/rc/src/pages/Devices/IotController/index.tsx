import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import {
  useIotControllerActions
} from '@acx-ui/rc/components'
import {
  useGetIotControllerListQuery,
  useLazyGetIotControllerVenuesQuery
} from '@acx-ui/rc/services'
import { defaultSort, IotControllerStatus, sortProp, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams }                        from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext }                     from '@acx-ui/user'

import { AssocVenueDrawer } from './AssocVenueDrawer'


export function IotController () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const iotControllerActions = useIotControllerActions()
  const { isCustomRole } = useUserProfileContext()
  const [ assocVenueDrawerVisible, setAssocVenueDrawerVisible ] = useState(false)
  const [ venueIds, setVenueIds ] = useState<string[]>([])
  const [ getIotControllerVenues ] = useLazyGetIotControllerVenuesQuery()

  const payload = {
    fields: [
      'id',
      'name',
      'inboundAddress',
      'publicAddress',
      'publicPort',
      'tenantId',
      'status',
      'assocVenueCount'
    ],
    filters: { tenantId: [params.tenantId] }
  }
  const settingsId = 'iot-controller-table'
  const tableQuery = useTableQuery({
    useQuery: useGetIotControllerListQuery,
    defaultPayload: payload,
    pagination: { settingsId },
    search: {
      searchTargetFields: ['name']
    }
  })

  function useColumns (
    searchable?: boolean
  ) {
    const { $t } = useIntl()

    const columns: TableProps<IotControllerStatus>['columns'] = [
      {
        title: $t({ defaultMessage: 'IoT Controller' }),
        key: 'name',
        dataIndex: 'name',
        sorter: { compare: sortProp('name', defaultSort) },
        fixed: 'left',
        searchable: searchable,
        defaultSortOrder: 'ascend',
        render: function (_, row, __, highlightFn) {
          return (
            <TenantLink
              to={`/devices/iotController/${row.id}/details/overview`}>
              {highlightFn(row.name)}</TenantLink>
          )
        }
      },{
        title: $t({ defaultMessage: 'FQDN / IP (AP)' }),
        dataIndex: 'inboundAddress',
        sorter: { compare: sortProp('inboundAddress', defaultSort) },
        key: 'inboundAddress'
      },
      {
        title: $t({ defaultMessage: 'FQDN / IP (Public)' }),
        dataIndex: 'publicAddress',
        sorter: { compare: sortProp('publicAddress', defaultSort) },
        key: 'publicAddress',
        render: function (_, row) {
          if (!row.publicAddress || !row.publicPort) {
            return '--'
          }
          return row.publicAddress + ':' + row.publicPort
        }
      },
      {
        title: $t({ defaultMessage: 'Associated <VenuePlural></VenuePlural>' }),
        dataIndex: 'assocVenueCount',
        sorter: { compare: sortProp('assocVenueCount', defaultSort) },
        key: 'assocVenueCount',
        render: function (_, row) {

          const onClickHandler = async () => {
            const venues = (await getIotControllerVenues({
              params: { iotId: row.id }
            }, false)).data
            if (venues) {
              setVenueIds(venues.venueIds)
            } else {
              setVenueIds([])
            }
            setAssocVenueDrawerVisible(true)
          }

          return <Button type='link' onClick={onClickHandler}> {row.assocVenueCount} </Button>
        }
      }
    ]

    return columns
  }

  const columns = useColumns(true)

  const rowActions: TableProps<IotControllerStatus>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    // rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.updateGateway)],
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate(`${selectedRows[0].id}/edit`, { replace: false })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    // rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.deleteGateway)],
    onClick: (rows, clearSelection) => {
      iotControllerActions.deleteIotController(rows, undefined, clearSelection)
    }
  }]

  const handleTableChange: TableProps<IotControllerStatus>['onChange'] = (
    pagination, filters, sorter, extra
  ) => {
    tableQuery.setPayload({
      ...tableQuery.payload
    })
    tableQuery.handleTableChange?.(pagination, filters, sorter, extra)
  }

  const count = tableQuery?.data?.totalCount || 0

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'IoT Controllers ({count})' }, { count })}
        extra={!isCustomRole && filterByAccess([
          <TenantLink to='/devices/iotController/add'
            // rbacOpsIds={[getOpsApi(CommonRbacUrlsInfo.addGateway)]}
          >
            <Button type='primary'>{ $t({ defaultMessage: 'Add IoT Controller' }) }</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery
      ]}>
        <Table<IotControllerStatus>
          settingsId={settingsId}
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={{ total: tableQuery?.data?.totalCount }}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey={(row: IotControllerStatus) => (row.id ?? `c-${row.id}`)}
          rowActions={isCustomRole ? [] : filterByAccess(rowActions)}
          rowSelection={{ type: 'checkbox' }}
          onChange={handleTableChange}
        />
        {assocVenueDrawerVisible && <AssocVenueDrawer
          key='association-drawer'
          visible={assocVenueDrawerVisible}
          setVisible={setAssocVenueDrawerVisible}
          usedVenueIds={venueIds || []}
        />
        }
      </Loader>
    </>
  )
}
