import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal, Tooltip }              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                               from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                                                                    from '@acx-ui/rc/components'
import { useDeleteDHCPServiceMutation, useGetDHCPProfileListViewModelQuery, useGetVenuesQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceListRoutePath,
  getServiceRoutePath,
  DHCPSaveData,
  DHCP_LIMIT_NUMBER,
  DHCPPool,
  IpUtilsService
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                               from '@acx-ui/user'

import { DEFAULT_GUEST_DHCP_NAME } from '../DHCPForm/DHCPForm'
import * as UI                     from '../DHCPForm/styledComponents'

export default function DHCPTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDeleteDHCPServiceMutation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tableQuery = useTableQuery({
    useQuery: useGetDHCPProfileListViewModelQuery,
    defaultPayload: {
      filters: {},
      fields: [
        'id',
        'name',
        'dhcpPools',
        'venueIds',
        'technology'
      ]
    },
    search: {
      searchString: '',
      searchTargetFields: ['name']
    }
  })

  const rowActions: TableProps<DHCPSaveData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedRows) => {
        return !selectedRows.some((row)=>{
          return (row.venueIds && row.venueIds.length>0)||
            row.name === DEFAULT_GUEST_DHCP_NAME
        })
      },
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Service' }),
            entityValue: name
          },
          onOk: () => {
            deleteFn({ params: { tenantId, serviceId: id } }).then(clearSelection)
          }
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      disabled: (selectedRows) => {
        return selectedRows.some((row)=>{
          return (row.venueIds && row.venueIds.length>0) ||
            row.name === DEFAULT_GUEST_DHCP_NAME
        })
      },
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: ServiceType.DHCP,
            oper: ServiceOperation.EDIT,
            serviceId: id!
          })
        })
      }
    }
  ]
  return (
    <>
      <PageHeader
        title={
          $t({
            defaultMessage: 'DHCP ({count})'
          },
          {
            count: tableQuery.data?.totalCount
          })
        }
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]
          : [
            { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
          ]
        }
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE })}>
            <Button type='primary'
              disabled={tableQuery.data?.totalCount
                ? tableQuery.data?.totalCount >= DHCP_LIMIT_NUMBER
                : false} >{$t({ defaultMessage: 'Add DHCP Service' })}</Button>
          </TenantLink>
        ])}
      />
      <UI.ToolTipStyle/>
      <Loader states={[tableQuery]}>
        <Table<DHCPSaveData>
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const params = useParams()
  const emptyVenues: { key: string, value: string }[] = []
  const { venueNameMap } = useGetVenuesQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueNameMap: data?.data
        ? data.data.map(venue => ({ key: venue.id, value: venue.name }))
        : emptyVenues
    })
  })

  const poolColumns: TableProps<DHCPPool>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name'
    },
    {
      key: 'startAddress',
      title: $t({ defaultMessage: 'Start host address' }),
      dataIndex: 'startAddress'
    },
    {
      key: 'endAddress',
      title: $t({ defaultMessage: 'End host address' }),
      dataIndex: 'endAddress'
    },
    {
      key: 'networkAddress',
      title: $t({ defaultMessage: 'Network address' }),
      dataIndex: 'networkAddress'
    },
    {
      key: 'networkAddress',
      title: $t({ defaultMessage: 'Number of hosts' }),
      dataIndex: 'networkAddress',
      align: 'center',
      render: (data,row)=>{
        return IpUtilsService.countIpRangeSize(row.startAddress, row.endAddress)
      }
    }
  ]
  const columns: TableProps<DHCPSaveData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.DHCP,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'pools',
      title: $t({ defaultMessage: 'DHCP Pools' }),
      dataIndex: 'dhcpPools',
      align: 'center',
      sorter: true,
      render: (data, row) =>{
        if (!row.dhcpPools || row.dhcpPools.length === 0) return 0
        const dhcpPools = row.dhcpPools
        return <Tooltip title={
          <Table<DHCPPool>
            type='compactBordered'
            style={{ width: 500 }}
            columns={poolColumns}
            dataSource={dhcpPools}
          />
        }
        placement='bottom'
        overlayClassName={UI.toolTipClassName}
        overlayInnerStyle={{ width: 515 }}>{dhcpPools.length}</Tooltip>
      }
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venueIds',
      filterable: venueNameMap,
      align: 'center',
      sorter: true,
      render: (data, row) =>{
        if (!row.venueIds || row.venueIds.length === 0) return 0
        const venueIds = row.venueIds
        // eslint-disable-next-line max-len
        const tooltipItems = venueNameMap.filter(v => venueIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={venueIds.length} />
      }
    }
  ]

  return columns
}
