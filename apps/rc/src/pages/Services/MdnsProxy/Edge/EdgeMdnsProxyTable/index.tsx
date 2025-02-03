import { useMemo } from 'react'

import { Space }   from 'antd'
import { groupBy } from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal,
  Tooltip
} from '@acx-ui/components'
import {
  CountAndNamesTooltip,
  MdnsProxyForwardingRulesTable,
  ToolTipTableStyle,
  useEdgeMdnssCompatibilityData,
  EdgeTableCompatibilityWarningTooltip
} from '@acx-ui/rc/components'
import { useDeleteEdgeMdnsProxyMutation, useGetEdgeMdnsProxyViewDataListQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceListRoutePath,
  getServiceRoutePath,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  useTableQuery,
  EdgeMdnsProxyViewData,
  defaultSort,
  MdnsProxyFeatureTypeEnum,
  EdgeServiceCompatibility,
  getServiceAllowedOperation,
  IncompatibilityFeatures
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

const settingsId = 'services-edge-mdns-proxy-table'
export function EdgeMdnsProxyTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn, { isLoading: isDeleting } ] = useDeleteEdgeMdnsProxyMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetEdgeMdnsProxyViewDataListQuery,
    defaultPayload: {
      fields: ['id', 'name', 'forwardingRules', 'activations'],
      filters: {}
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    },
    pagination: { settingsId }
  })

  const rowActions: TableProps<EdgeMdnsProxyViewData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: ServiceType.EDGE_MDNS_PROXY,
            oper: ServiceOperation.EDIT,
            serviceId: id!
          })
        })
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.EDIT),
      rbacOpsIds: getServiceAllowedOperation(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.EDIT)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Edge mDNS Proxy' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteFn({ params: { serviceId: row.id } }).unwrap()))
              .then(clearSelection)
          }
        })
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.DELETE),
      rbacOpsIds: getServiceAllowedOperation(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.DELETE)
    }
  ]

  const currentServiceIds = useMemo(
    () => tableQuery.data?.data?.map(i => i.id!) ?? [],
    [tableQuery.data?.data])
  const skipFetchCompatibilities = currentServiceIds.length === 0
  // eslint-disable-next-line max-len
  const compatibilityData = useEdgeMdnssCompatibilityData(currentServiceIds, skipFetchCompatibilities)

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'mDNS Proxy for RUCKUS Edge ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByService(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.CREATE)}
            // eslint-disable-next-line max-len
            rbacOpsIds={getServiceAllowedOperation(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.CREATE)}
            // eslint-disable-next-line max-len
            to={getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY, oper: ServiceOperation.CREATE })}
          >
            <Button type='primary'>
              {$t({ defaultMessage: 'Add mDNS Proxy Service' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery, { isLoading: false, isFetching: isDeleting }]}>
        <ToolTipTableStyle.ToolTipStyle/>
        <Table
          rowKey='id'
          settingsId={settingsId}
          columns={useColumns(compatibilityData.compatibilities)}
          dataSource={tableQuery.data?.data}
          rowActions={allowedRowActions}
          rowSelection={(allowedRowActions.length > 0) && { type: 'checkbox' }}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          pagination={tableQuery.pagination}
          enableApiFilter
        />
      </Loader>
    </>
  )
}

function useColumns (compatibilityData?: Record<string, EdgeServiceCompatibility[]>) {
  const { $t } = useIntl()
  const emptyVenues: { key: string, value: string }[] = []
  const { venueNameMap } = useVenuesListQuery({
    payload: {
      fields: ['id', 'name'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10000
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueNameMap: data?.data
        ? data.data.map(venue => ({ key: venue.id, value: venue.name }))
        : emptyVenues
    })
  })

  const columns: TableProps<EdgeMdnsProxyViewData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: function (_, row) {
        return (<Space>
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_MDNS_PROXY,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {row.name}
          </TenantLink>
          <EdgeTableCompatibilityWarningTooltip
            serviceId={row.id!}
            featureName={IncompatibilityFeatures.EDGE_MDNS_PROXY}
            compatibility={compatibilityData}
          />
        </Space>)
      }
    },
    {
      key: 'forwardingRules',
      title: $t({ defaultMessage: 'Forwarding Rules' }),
      dataIndex: 'forwardingRules',
      align: 'center',
      sorter: true,
      render: function (_, { forwardingRules }) {
        return forwardingRules?.length
          ? <Tooltip
            title={<MdnsProxyForwardingRulesTable
              featureType={MdnsProxyFeatureTypeEnum.EDGE}
              rowKey='ruleIndex'
              readonly
              tableType={'compactBordered'}
              rules={forwardingRules}
            />}
            children={forwardingRules.length}
            dottedUnderline
            placement='bottom'
            overlayClassName={ToolTipTableStyle.toolTipClassName}
            overlayInnerStyle={{ minWidth: 380 }}
          />
          : 0
      }
    },
    {
      key: 'activations',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'activations',
      align: 'center',
      filterKey: 'activations.venueId',
      filterable: venueNameMap,
      sorter: true,
      render: function (_, row) {
        if (!row.activations || row.activations.length === 0) return 0

        const venueIds = Object.keys(groupBy(row.activations, 'venueId'))
        const venueNames = venueNameMap.filter(v => venueIds!.includes(v.key)).map(v => v.value)
        return <CountAndNamesTooltip data={{
          count: venueIds.length, names: venueNames.sort(defaultSort) as string[]
        }}
        />
      }
    }
  ]

  return columns
}