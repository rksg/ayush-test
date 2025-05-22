import { useIntl }          from 'react-intl'
import { FormattedMessage } from 'react-intl'

import { Button, Loader, PageHeader, Table, TableProps, Tooltip, showActionModal } from '@acx-ui/components'
import {
  authenticationTypeLabel,
  AuthenticationType
}                                                 from '@acx-ui/rc/components'
import {
  useDeleteFlexAuthenticationProfileMutation,
  useGetFlexAuthenticationProfilesQuery
}                     from '@acx-ui/rc/services'
import {
  FlexibleAuthentication,
  getPolicyDetailsLink,
  usePoliciesBreadcrumb,
  getPolicyAllowedOperation,
  getPolicyRoutePath,
  SwitchUrlsInfo,
  PolicyOperation,
  PolicyType,
  useTableQuery
}                                                                  from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }                                 from '@acx-ui/types'
import {
  filterByAccess,
  getUserProfile,
  hasAllowedOperations,
  hasCrossVenuesPermission,
  hasPermission
}                from '@acx-ui/user'
import { noDataDisplay, getOpsApi } from '@acx-ui/utils'

export const getItemTooltip = (items: string[]) => {
  return items?.length ? <FormattedMessage
    defaultMessage={'{switches}'}
    values={{
      switches: items.map((item, index) => (
        <span key={item}>
          {item}
          {index < items.length - 1 && <br />}
        </span>
      ))
    }}
  /> : ''
}

const FlexibleAuthenticationTable = () => {
  const { $t } = useIntl()
  const basePath: Path = useTenantLink('')
  const { rbacOpsApiEnabled } = getUserProfile()

  const navigate = useNavigate()
  const [deleteFlexAuthenticationProfile] = useDeleteFlexAuthenticationProfileMutation()

  const typeFilterOptions = Object.values(AuthenticationType).map(key => ({
    key, value: $t(authenticationTypeLabel[key])
  }))

  const tableQuery = useTableQuery({
    useQuery: useGetFlexAuthenticationProfilesQuery,
    defaultPayload: {
      filters: {},
      enableAggregateAppliedTargets: true
    },
    sorter: {
      sortField: 'profileName',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['profileName']
    }
  })

  const columns: TableProps<FlexibleAuthentication>['columns'] = [{
    title: $t({ defaultMessage: 'Name' }),
    key: 'profileName',
    dataIndex: 'profileName',
    searchable: true,
    sorter: true,
    defaultSortOrder: 'ascend',
    render: (_, row) => {
      return <TenantLink
        rbacOpsIds={getPolicyAllowedOperation(PolicyType.FLEX_AUTH, PolicyOperation.DETAIL)}
        to={getPolicyDetailsLink({
          type: PolicyType.FLEX_AUTH,
          oper: PolicyOperation.DETAIL,
          policyId: row.id || ''
        })}>
        {row.profileName}
      </TenantLink>
    }
  },
  {
    title: $t({ defaultMessage: 'Type' }),
    key: 'authenticationType',
    dataIndex: 'authenticationType',
    filterMultiple: false,
    filterable: typeFilterOptions,
    sorter: true,
    render: (_, { authenticationType }) => {
      return $t(authenticationTypeLabel[authenticationType as keyof typeof authenticationTypeLabel])
    }
  },
  {
    title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
    key: 'appliedVenues',
    dataIndex: 'appliedVenues',
    render: (_, { appliedVenues }) => {
      const venueCount = Object.keys(appliedVenues ?? {})?.length
      const venues = Object.values(appliedVenues ?? {})?.sort()
      return venueCount
        ? <Tooltip dottedUnderline title={getItemTooltip(venues)}>{ venueCount }</Tooltip>
        : noDataDisplay
    }
  }]

  const rowActions: TableProps<FlexibleAuthentication>['rowActions'] = [{
    scopeKey: [SwitchScopes.UPDATE],
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.FLEX_AUTH, PolicyOperation.EDIT),
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: ([selectedRow]) => {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
          type: PolicyType.FLEX_AUTH,
          oper: PolicyOperation.EDIT,
          policyId: selectedRow.id || ''
        })
      })
    }
  },
  {
    scopeKey: [SwitchScopes.DELETE],
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.FLEX_AUTH, PolicyOperation.DELETE),
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([selectedRow], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Profile' }),
          entityValue: selectedRow.profileName
        },
        onOk: () => {
          deleteFlexAuthenticationProfile({ params: { profileId: selectedRow?.id } })
            .then(clearSelection)
        }
      })
    }
  }]

  const isSelectionVisible = rbacOpsApiEnabled
    ? hasAllowedOperations([
      getOpsApi(SwitchUrlsInfo.updateFlexAuthenticationProfile),
      getOpsApi(SwitchUrlsInfo.deleteFlexAuthenticationProfile)
    ])
    : hasCrossVenuesPermission() && hasPermission({
      scopes: [SwitchScopes.UPDATE, SwitchScopes.DELETE]
    })

  return (<>
    <PageHeader
      title={
        $t(
          { defaultMessage: 'Authentication ({count})' },
          { count: tableQuery.data?.totalCount }
        )
      }
      breadcrumb={usePoliciesBreadcrumb()}
      extra={hasCrossVenuesPermission() && filterByAccess([<TenantLink
        scopeKey={[SwitchScopes.CREATE]}
        rbacOpsIds={getPolicyAllowedOperation(PolicyType.FLEX_AUTH, PolicyOperation.CREATE)}
        to={getPolicyRoutePath({
          type: PolicyType.FLEX_AUTH,
          oper: PolicyOperation.CREATE
        })}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Add Authentication' })}</Button>
      </TenantLink>
      ])}
    />
    <Loader states={[tableQuery]}>
      <Table
        rowKey='id'
        columns={columns}
        rowActions={hasCrossVenuesPermission() ? filterByAccess(rowActions) : []}
        rowSelection={isSelectionVisible && { type: 'radio' }}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  </>)
}

export default FlexibleAuthenticationTable
