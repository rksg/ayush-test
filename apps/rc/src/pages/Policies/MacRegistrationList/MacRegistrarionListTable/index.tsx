import { ReactNode, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  Table,
  TableProps,
  showToast
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                        from '@acx-ui/rc/components'
import {
  doProfileDelete, useAdaptivePolicySetListQuery,
  useDeleteMacRegListMutation,
  useLazyNetworkListQuery,
  useSearchMacRegListsQuery
} from '@acx-ui/rc/services'
import {
  FILTER,
  MacRegistrationDetailsTabKey,
  MacRegistrationPool,
  PolicyOperation,
  PolicyType,
  SEARCH,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  returnExpirationString,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                               from '@acx-ui/user'

export default function MacRegistrationListsTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [networkVenuesMap, setNetworkVenuesMap] = useState(new Map())
  const params = useParams()

  const policyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isAsync = useIsSplitOn(Features.CLOUDPATH_ASYNC_API_TOGGLE)
  const customHeaders = (isAsync) ? { Accept: 'application/vnd.ruckus.v2+json' } : undefined

  const filter = {
    filterKey: 'name',
    operation: 'cn',
    value: ''
  }

  const tableQuery = useTableQuery({
    useQuery: useSearchMacRegListsQuery,
    defaultPayload: {
      dataOption: 'all',
      searchCriteriaList: [
        { ...filter }
      ]
    }
  })

  const [
    deleteMacRegList,
    { isLoading: isDeleteMacRegListUpdating }
  ] = useDeleteMacRegListMutation()

  const [getNetworkList] = useLazyNetworkListQuery()

  const { policySetMap, getPolicySetsLoading } = useAdaptivePolicySetListQuery(
    { payload: { page: 1, pageSize: '2147483647' } }, {
      selectFromResult: ({ data, isLoading }) => {
        const policySetMap = new Map(data?.data.map((policySet) =>
          [policySet.id, policySet.name]))
        return {
          policySetMap,
          getPolicySetsLoading: isLoading
        }
      }, skip: !policyEnabled
    })

  useEffect(() => {
    if (tableQuery.isLoading)
      return

    getNetworkList({
      params,
      payload: {
        fields: [ 'venues', 'id' ],
        page: 1,
        pageSize: 10000
      } }).then(result => {
      const networkList = new Map()
      result.data?.data.forEach(n => networkList.set(n.id, n.venues.names))
      setNetworkVenuesMap(networkList)
    })

  }, [tableQuery.data])

  function useColumns () {
    const columns: TableProps<MacRegistrationPool>['columns'] = [
      {
        title: $t({ defaultMessage: 'Name' }),
        key: 'name',
        dataIndex: 'name',
        sorter: true,
        searchable: true,
        defaultSortOrder: 'ascend',
        render: function (_, row, __, highlightFn) {
          return (
            <TenantLink
              to={getPolicyDetailsLink({
                type: PolicyType.MAC_REGISTRATION_LIST,
                oper: PolicyOperation.DETAIL,
                policyId: row.id!,
                activeTab: MacRegistrationDetailsTabKey.OVERVIEW
              })}
            >{highlightFn(row.name)}</TenantLink>
          )
        }
      },
      {
        title: $t({ defaultMessage: 'List Expiration' }),
        key: 'expirationType',
        dataIndex: 'expirationType',
        sorter: true,
        render: function (_, row) {
          return returnExpirationString(row)
        }
      },
      {
        title: $t({ defaultMessage: 'Default Access' }),
        key: 'defaultAccess',
        dataIndex: 'defaultAccess',
        show: policyEnabled,
        sorter: true,
        render: function (_:ReactNode, row:MacRegistrationPool) {
          return row.policySetId ? row.defaultAccess: ''
        }
      },
      {
        title: $t({ defaultMessage: 'Adaptive Policy Set' }),
        key: 'policySet',
        dataIndex: 'policySetId',
        show: policyEnabled,
        sorter: true,
        render: function (_:ReactNode, row:MacRegistrationPool) {
          return row.policySetId ? policySetMap.get(row.policySetId) : ''
        }
      },
      {
        title: $t({ defaultMessage: 'MAC Addresses' }),
        key: 'registrationCount',
        dataIndex: 'registrationCount',
        align: 'center',
        render: function (_, row) {
          return (
            <TenantLink
              to={getPolicyDetailsLink({
                type: PolicyType.MAC_REGISTRATION_LIST,
                oper: PolicyOperation.DETAIL,
                policyId: row.id!,
                activeTab: MacRegistrationDetailsTabKey.MAC_REGISTRATIONS
              })}
            >{row.registrationCount ?? 0}</TenantLink>
          )
        }
      },
      {
        title: $t({ defaultMessage: 'Venues' }),
        key: 'venueCount',
        dataIndex: 'venueCount',
        align: 'center',
        render: function (_, row) {
          if(networkVenuesMap.size > 0) {
            // eslint-disable-next-line max-len
            const venueNames = row.networkIds?.map(id => networkVenuesMap.get(id)).flat().filter(item => item)
            const toolTipItems: string [] = Array.from(new Set(venueNames))
            return toolTipItems.length === 0 ? 0 :
              <SimpleListTooltip items={toolTipItems} displayText={toolTipItems.length}/>
          }
          return 0
        }
      }
    ]
    return columns
  }

  const rowActions: TableProps<MacRegistrationPool>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
          type: PolicyType.MAC_REGISTRATION_LIST,
          oper: PolicyOperation.EDIT,
          policyId: selectedRows[0].id!
        })
      })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([selectedRow], clearSelection) => {
      doProfileDelete(
        [selectedRow],
        $t({ defaultMessage: 'List' }),
        selectedRow.name,
        [
          { fieldName: 'associationIds', fieldText: $t({ defaultMessage: 'Identity' }) },
          { fieldName: 'networkIds', fieldText: $t({ defaultMessage: 'Network' }) }
        ],
        async () => deleteMacRegList({ params: { policyId: selectedRow.id }, customHeaders })
          .unwrap()
          .then(() => {
            if (!isAsync) {
              showToast({
                type: 'success',
                content: $t({ defaultMessage: 'List {name} was deleted' },
                  { name: selectedRow.name })
              })
            }
            clearSelection()
          }).catch((error) => {
            console.log(error) // eslint-disable-line no-console
          })
      )}
  }]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      dataOption: 'all',
      searchCriteriaList: [
        { ...filter, value: customSearch?.searchString ?? '' }
      ]
    }
    tableQuery.setPayload(payload)
  }

  return (
    <>
      <PageHeader
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true) }
        ]}
        title={$t({ defaultMessage: 'MAC Registration Lists' })}
        extra={filterByAccess([
          <TenantLink
            // eslint-disable-next-line max-len
            to={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })}
          >
            <Button type='primary'>{ $t({ defaultMessage: 'Add MAC Registration List' }) }</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery,
        { isLoading: getPolicySetsLoading, isFetching: isDeleteMacRegListUpdating }
      ]}>
        <Table<MacRegistrationPool>
          enableApiFilter
          settingsId='mac-reg-list-table'
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          onFilterChange={handleFilterChange}
          rowSelection={hasAccess() && { type: 'radio' }}
        />
      </Loader>
    </>
  )
}
