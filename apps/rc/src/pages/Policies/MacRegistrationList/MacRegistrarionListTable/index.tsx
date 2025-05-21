import { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader, showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                           from '@acx-ui/rc/components'
import {
  doProfileDelete, useAdaptivePolicySetListByQueryQuery,
  useDeleteMacRegListMutation, useGetVenuesQuery,
  useNetworkListQuery,
  useSearchMacRegListsQuery, useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  FILTER,
  MacRegistrationDetailsTabKey,
  MacRegistrationPool,
  PolicyOperation,
  PolicyType,
  SEARCH,
  getPolicyDetailsLink,
  usePoliciesBreadcrumb,
  getPolicyRoutePath,
  returnExpirationString,
  useTableQuery,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  MacRegListUrlsInfo
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { getOpsApi }                                               from '@acx-ui/utils'

export default function MacRegistrationListsTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const params = useParams()

  const isIdentityRequired = useIsSplitOn(Features.MAC_REGISTRATION_REQUIRE_IDENTITY_GROUP_TOGGLE)

  const filter = {
    filterKey: 'name',
    operation: 'cn',
    value: ''
  }

  const settingsId = 'mac-reg-list-table'
  const tableQuery = useTableQuery({
    useQuery: useSearchMacRegListsQuery,
    defaultPayload: {
      dataOption: 'all',
      searchCriteriaList: [
        { ...filter }
      ]
    },
    pagination: { settingsId }
  })

  const [
    deleteMacRegList,
    { isLoading: isDeleteMacRegListUpdating }
  ] = useDeleteMacRegListMutation()

  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

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

  const { policySetMap, getPolicySetsLoading } = useAdaptivePolicySetListByQueryQuery(
    { payload: { page: 1, pageSize: '2000' } }, {
      selectFromResult: ({ data, isLoading }) => {
        const policySetMap = new Map(data?.data.map((policySet) =>
          [policySet.id, policySet.name]))
        return {
          policySetMap,
          getPolicySetsLoading: isLoading
        }
      }
    })

  const getNetworkListQuery = isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery

  const { networkVenuesMap } = getNetworkListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: [ 'venues', 'id', 'venueApGroups' ],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => {
      const networkList = new Map()
      data?.data.forEach( n => {
        networkList.set(n.id, isWifiRbacEnabled ? n.venues.ids : n.venues.names) })
      return {
        networkVenuesMap: networkList
      }
    }
  })

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
              rbacOpsIds={[getOpsApi(MacRegListUrlsInfo.getMacRegistrationPool)]}
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
        sorter: true,
        render: function (_:ReactNode, row:MacRegistrationPool) {
          return row.policySetId ? row.defaultAccess: ''
        }
      },
      {
        title: $t({ defaultMessage: 'Adaptive Policy Set' }),
        key: 'policySet',
        dataIndex: 'policySetId',
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
              rbacOpsIds={[getOpsApi(MacRegListUrlsInfo.getMacRegistrations)]}
            >{row.registrationCount ?? 0}</TenantLink>
          )
        }
      },
      {
        title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
        key: 'venueCount',
        dataIndex: 'venueCount',
        align: 'center',
        render: function (_, row) {
          if(networkVenuesMap.size > 0) {
            // eslint-disable-next-line max-len
            const venues = row.networkIds?.map(id => networkVenuesMap.get(id)).flat().filter(item => item) ?? []
            const toolTipItems: string [] = isWifiRbacEnabled ?
              venueNameMap.filter(v => venues!.includes(v.key)).map(v => v.value)
              : Array.from(new Set(venues))
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
    scopeKey: getScopeKeyByPolicy(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.EDIT),
    rbacOpsIds: [getOpsApi(MacRegListUrlsInfo.updateMacRegistrationPool)],
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
    scopeKey: getScopeKeyByPolicy(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.DELETE),
    rbacOpsIds: [getOpsApi(MacRegListUrlsInfo.deleteMacRegistrationPool)],
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([selectedRow], clearSelection) => {
      if (isIdentityRequired) {
        if (selectedRow.registrationCount > 0) {
          showActionModal({
            type: 'error',
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: 'You are unable to delete this list due to it has Mac Registrations' }),
            customContent: {
              action: 'SHOW_ERRORS'
            }
          })
        } else {
          doProfileDelete(
            [selectedRow],
            $t({ defaultMessage: 'List' }),
            selectedRow.name,
            [],
            async () => deleteMacList(selectedRow.id!, clearSelection))
        }
      } else {
        doProfileDelete(
          [selectedRow],
          $t({ defaultMessage: 'List' }),
          selectedRow.name,
          [
            { fieldName: 'associationIds', fieldText: $t({ defaultMessage: 'Identity' }) },
            { fieldName: 'networkIds', fieldText: $t({ defaultMessage: 'Network' }) }
          ],
          async () => deleteMacList(selectedRow.id!, clearSelection))
      }
    }
  }]

  const deleteMacList = (macListId: string, clearSelection: () => void) => {
    deleteMacRegList({ params: { policyId: macListId } })
      .unwrap()
      .then(() => {
        clearSelection()
      }).catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      dataOption: 'all',
      searchCriteriaList: [
        { ...filter, value: customSearch?.searchString ?? '' }
      ]
    }
    tableQuery.setPayload(payload)
  }

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        breadcrumb={usePoliciesBreadcrumb()}
        title={$t({ defaultMessage: 'MAC Registration Lists' })}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            // eslint-disable-next-line max-len
            to={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })}
            scopeKey={getScopeKeyByPolicy(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.CREATE)}
            rbacOpsIds={[getOpsApi(MacRegListUrlsInfo.createMacRegistrationPool)]}
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
          settingsId={settingsId}
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={allowedRowActions}
          onFilterChange={handleFilterChange}
          rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
        />
      </Loader>
    </>
  )
}
