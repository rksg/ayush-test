import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, Table, TableProps, showActionModal } from '@acx-ui/components'
import {
  useDeleteFlexAuthenticationProfileMutation,
  useGetFlexAuthenticationProfilesQuery
}                     from '@acx-ui/rc/services'
import {
  FlexibleAuthentication,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  useTableQuery
}                                                                  from '@acx-ui/rc/utils'
import { Path, TenantLink, useParams, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }                                            from '@acx-ui/types'
import { filterByAccess, hasPermission }                           from '@acx-ui/user'

const FlexibleAuthenticationTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const basePath: Path = useTenantLink('')
  const navigate = useNavigate()
  const [deleteFlexAuthenticationProfile] = useDeleteFlexAuthenticationProfileMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetFlexAuthenticationProfilesQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    },
    option: {
      skip: true //TODO
    }
  })

  const columns: TableProps<FlexibleAuthentication>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'profileName',
      dataIndex: 'profileName',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => { //TODO
        return row.profileId ?
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.FLEX_AUTH,
            oper: PolicyOperation.DETAIL,
            policyId: row.profileId
          })}>
            {row.profileName}
          </TenantLink>
          : row.profileName
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'authenticationType',
      dataIndex: 'authenticationType',
      filterable: true,
      sorter: true,
      render: (_, { authenticationType }) => authenticationType
    }
  ]

  const rowActions: TableProps<FlexibleAuthentication>['rowActions'] = [
    {
      scopeKey: [SwitchScopes.UPDATE],
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([selectedRow]) => {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.FLEX_AUTH,
            oper: PolicyOperation.EDIT,
            policyId: selectedRow.profileId || ''
          })
        })
      }
    },
    {
      scopeKey: [SwitchScopes.DELETE],
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Profile' }),
            entityValue: rows.length === 1 ? rows[0].profileName : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteFlexAuthenticationProfile({ params, payload: rows.map(item => item.profileId) })
              .then(clearSelection)
          }
        })
      }
    }
  ]

  const isSelectionVisible = hasPermission({
    scopes: [SwitchScopes.UPDATE, SwitchScopes.DELETE]
  })

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Flexible Authentication ({count})' },
            { count: tableQuery.data?.totalCount }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}

        extra={filterByAccess([<TenantLink
          scopeKey={[SwitchScopes.CREATE]}
          to={getPolicyRoutePath({
            type: PolicyType.FLEX_AUTH,
            oper: PolicyOperation.CREATE
          })}
        >
          <Button type='primary'>{$t({ defaultMessage: 'Add Flexible Authentication' })}</Button>
        </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table
          rowKey='id'
          columns={columns}
          rowActions={filterByAccess(rowActions)}
          rowSelection={isSelectionVisible && { type: 'checkbox' }}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

export default FlexibleAuthenticationTable