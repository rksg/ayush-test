import _                                from 'lodash'
import { useIntl }                      from 'react-intl'
import { Path, useNavigate, useParams } from 'react-router-dom'

import {
  Button,
  ColumnType,
  Loader,
  PageHeader,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { CountAndNamesTooltip }   from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteApSnmpPolicyMutation,
  useGetApSnmpViewModelQuery
} from '@acx-ui/rc/services'
import {
  ApSnmpViewModelData,
  filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink,
  usePoliciesBreadcrumb,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  GetApiVersionHeader,
  ApiVersionEnum,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink } from '@acx-ui/react-router-dom'

const rbacSnmpFields = [
  'id',
  'name',
  'communityNames',
  'userNames',
  'apSerialNumbers',
  'apNames',
  'venueIds',
  'apActivations'
]

export default function SnmpAgentTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId } = useParams()
  const tenantBasePath: Path = useTenantLink('')

  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const defaultPayload = {
    searchString: '',
    fields: (isUseRbacApi) ? rbacSnmpFields:
      [ 'id', 'name', 'v2Agents', 'v3Agents', 'venues', 'aps', 'tags' ],
    searchTargetFields: (isUseRbacApi) ?
      ['name', 'communityNames', 'userNames', 'apNames'] :
      ['name', 'v2Agents.name', 'v3Agents.name', 'aps.name'],
    sortField: 'name',
    sortOrder: 'ASC',
    page: 1,
    pageSize: 25
  }

  const filterPayload = {
    searchString: '',
    fields: (isUseRbacApi) ? ['id', 'name', 'venueIds']: [ 'id', 'name', 'venues' ]
  }


  // eslint-disable-next-line
  const isSNMPv3PassphraseOn = useIsSplitOn(Features.WIFI_SNMP_V3_AGENT_PASSPHRASE_COMPLEXITY_TOGGLE)
  const filterResults = useTableQuery({
    useQuery: useGetApSnmpViewModelQuery,
    enableRbac: isUseRbacApi,
    pagination: {
      pageSize: 100
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    defaultPayload: filterPayload,
    customHeaders:
    ( isUseRbacApi ?
      GetApiVersionHeader((isSNMPv3PassphraseOn? ApiVersionEnum.v1_1 : ApiVersionEnum.v1)):
      undefined)
  })

  const list = filterResults.data
  let customerVenues: string[] = []

  if (list && list.totalCount > 0) {
    list?.data.forEach((c => {
      const { names, count } = c.venues || {}
      if (count) {
        customerVenues = customerVenues.concat(names)
      }
    }))

    customerVenues = _.uniq(customerVenues)
  }

  const filterables = { venues: customerVenues?.map(v => ({ key: v, value: v })) }

  const tableQuery = useTableQuery({
    useQuery: useGetApSnmpViewModelQuery,
    enableRbac: isUseRbacApi,
    defaultPayload,
    search: {
      searchTargetFields: defaultPayload.searchTargetFields as string[]
    },
    customHeaders:
    ( isUseRbacApi ?
      GetApiVersionHeader((isSNMPv3PassphraseOn? ApiVersionEnum.v1_1 : ApiVersionEnum.v1)):
      undefined)
  })

  const [ deleteFn ] = useDeleteApSnmpPolicyMutation()
  const rowActions: TableProps<ApSnmpViewModelData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: getScopeKeyByPolicy(PolicyType.SNMP_AGENT, PolicyOperation.EDIT),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.SNMP_AGENT, PolicyOperation.EDIT),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.SNMP_AGENT,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: getScopeKeyByPolicy(PolicyType.SNMP_AGENT, PolicyOperation.DELETE),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.SNMP_AGENT, PolicyOperation.DELETE),
      onClick: (selectedRows, clearSelection) => {
        doProfileDelete(
          selectedRows,
          $t({ defaultMessage: 'SNMP Agent' }),
          selectedRows[0].name,
          [{
            fieldName: 'venueIds',
            fieldText: $t({ defaultMessage: '<venuePlural></venuePlural>' })
          },
          {
            fieldName: 'apActivations',
            fieldText: $t({ defaultMessage: 'aps' })
          }],
          async () => {
            const ids = selectedRows.map(row => row.id)
            await deleteFn({
              params: { tenantId, policyId: ids[0] },
              enableRbac: isUseRbacApi
            }).then(clearSelection)
          }
        )
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'SNMP Agent {count}' },
            { count: (list)? `(${list.totalCount})` : '' }
          )
        }
        breadcrumb={usePoliciesBreadcrumb()}
        extra={((list?.totalCount as number) < 64) && filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByPolicy(PolicyType.SNMP_AGENT, PolicyOperation.CREATE)}
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.SNMP_AGENT, PolicyOperation.CREATE)}
            to={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.CREATE })}
          >
            <Button type='primary'>
              {$t({ defaultMessage: 'Add SNMP Agent' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<ApSnmpViewModelData>
          columns={useColumns( true, filterables )}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='id'
          rowActions={allowedRowActions}
          rowSelection={(allowedRowActions.length > 0) && { type: 'radio' }}
        />
      </Loader>
    </>
  )
}

function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }) {
  const intl = useIntl()
  const { $t } = intl
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const columns: TableProps<ApSnmpViewModelData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      searchable: searchable,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.SNMP_AGENT,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      key: 'v2Agents',
      title: $t({ defaultMessage: 'SNMP v2' }),
      dataIndex: 'v2Agents',
      align: 'center',
      sorter: true,
      render: (_, row) => (
        <CountAndNamesTooltip data={row.v2Agents} maxShow={25}/>
      )
    },
    {
      key: 'v3Agents',
      title: $t({ defaultMessage: 'SNMP v3' }),
      dataIndex: 'v3Agents',
      align: 'center',
      sorter: true,
      render: (_, row) => (
        <CountAndNamesTooltip data={row.v3Agents} maxShow={25}/>
      )
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venues',
      align: 'center',
      sorter: true,
      filterKey: (isUseRbacApi) ? 'venueNames' :'venues.name.keyword',
      filterable: filterables ? filterables['venues'] : false,
      render: (_, row) => (
        <CountAndNamesTooltip data={row.venues} maxShow={25}/>
      )
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      align: 'center',
      sorter: true,
      render: (_, row) => (
        <CountAndNamesTooltip data={row.aps} maxShow={25}/>
      )
    }/*,
    {
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      align: 'center',
      render: function (data, row) {
          return <>data.map(tag => <Button key={tag} type=link>{tag}</Button>)
      }
    }*/
  ]

  return columns
}
