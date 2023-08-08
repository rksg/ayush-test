import _                                from 'lodash'
import { IntlShape, useIntl }           from 'react-intl'
import { Path, useNavigate, useParams } from 'react-router-dom'

import { Button, ColumnType, Loader, PageHeader, showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import { useDeleteApSnmpPolicyMutation, useGetApSnmpViewModelQuery }                           from '@acx-ui/rc/services'
import {
  ApSnmpViewModelData,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  SnmpColumnData,
  useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

const defaultPayload = {
  searchString: '',
  fields: [ 'id', 'name', 'v2Agents', 'v3Agents', 'venues', 'aps', 'tags' ],
  searchTargetFields: ['name', 'v2Agents.name', 'v3Agents.name', 'venues.name', 'aps.name'],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25
}

const filterPayload = {
  searchString: '',
  fields: [ 'id', 'name', 'venues' ]
}

export default function SnmpAgentTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId } = useParams()
  const tenantBasePath: Path = useTenantLink('')

  const filterResults = useTableQuery({
    useQuery: useGetApSnmpViewModelQuery,
    pagination: {
      pageSize: 100
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    defaultPayload: filterPayload
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
    defaultPayload,
    search: {
      searchTargetFields: defaultPayload.searchTargetFields as string[]
    }
  })

  const [ deleteFn ] = useDeleteApSnmpPolicyMutation()
  const rowActions: TableProps<ApSnmpViewModelData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
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
      onClick: (selectedRows, clearSelection) => {
        const ids = selectedRows.map(row => row.id)
        const hasSnmpActivityVenues = _.some(selectedRows, (r) => {
          const numOfActivityVenues = r.venues?.count || 0
          return numOfActivityVenues > 0
        })

        if ( hasSnmpActivityVenues ) {
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Delete a SNMP agent that is currently in use?' }),
            content: $t({
              // eslint-disable-next-line max-len
              defaultMessage: 'This agent is currently activated on venues. Deleting it will deactivate the agent for those venues/ APs. Are you sure you want to delete it?'
            }),
            onOk: () => {
              deleteFn({ params: { tenantId, policyId: ids[0] } }).then(clearSelection)
            },
            onCancel: () => { clearSelection() },
            okText: $t({ defaultMessage: 'Delete' })
          })
        } else {
          deleteFn({ params: { tenantId, policyId: ids[0] } }).then(clearSelection)
        }
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'SNMP Agent {count}' },
            { count: (list)? `(${list.totalCount})` : '' }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={((list?.totalCount as number) < 64) && filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.CREATE })} key='add'>
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
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
        />
      </Loader>
    </>
  )
}

export function renderToListTooltip ({ $t }: IntlShape, data: SnmpColumnData, maxShow = 25) {
  const { count, names } = data || {}
  const namesLen = (names && names.length) || 0

  if (namesLen > 0) {
    const truncateData = names.slice(0, maxShow-1)

    if (namesLen > maxShow) {
      truncateData.push(
        $t({ defaultMessage: 'And {total} more...' },
          { total: namesLen - maxShow })
      )
    }
    const tootipTitle = truncateData.map(n => <div>{n}</div>)
    return <Tooltip title={tootipTitle} placement='bottom'>{count}</Tooltip>
  }

  return count
}

function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }) {
  const intl = useIntl()
  const { $t } = intl

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
      render: function (_, row) {
        return renderToListTooltip(intl, row.v2Agents)
      }
    },
    {
      key: 'v3Agents',
      title: $t({ defaultMessage: 'SNMP v3' }),
      dataIndex: 'v3Agents',
      align: 'center',
      sorter: true,
      render: function (_, row) {
        return renderToListTooltip(intl, row.v3Agents)
      }
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      align: 'center',
      sorter: true,
      filterKey: 'venues.name.keyword',
      filterable: filterables ? filterables['venues'] : false,
      render: function (_, row) {
        return renderToListTooltip(intl, row.venues)
      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      align: 'center',
      sorter: true,
      render: function (_, row) {
        return renderToListTooltip(intl, row.aps)
      }
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
