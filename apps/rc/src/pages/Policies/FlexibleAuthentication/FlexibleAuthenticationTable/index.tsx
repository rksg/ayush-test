import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, Table, TableProps, showActionModal } from '@acx-ui/components'
import {
  useDeleteEthernetPortProfileMutation,
  useGetEthernetPortProfileViewDataListQuery
}                     from '@acx-ui/rc/services'
import {
  EthernetPortProfileViewData,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  useTableQuery
}                                                                  from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }                                 from '@acx-ui/types'
import { filterByAccess, hasPermission }                from '@acx-ui/user'

const FlexibleAuthenticationTable = () => {
  const { $t } = useIntl()
  // const params = useParams()
  const defaultEthernetPortProfileTablePayload = {}
  const basePath: Path = useTenantLink('')
  const navigate = useNavigate()
  const [deleteEthernetPortProfile] = useDeleteEthernetPortProfileMutation()

  const tableQuery = useTableQuery({ //TODO
    useQuery: useGetEthernetPortProfileViewDataListQuery,
    defaultPayload: defaultEthernetPortProfileTablePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    }
  })

  const columns: TableProps<EthernetPortProfileViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => { //TODO
        return (
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.FLEX_AUTH,
            oper: PolicyOperation.DETAIL,
            policyId: row.id || '123'
          })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: true,
      render: (_, { type }) => type //TODO
    }
  ]

  const rowActions: TableProps<EthernetPortProfileViewData>['rowActions'] = [
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
            policyId: selectedRow.id
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
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteEthernetPortProfile({ params: { id: row.id } })))
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
          scopeKey={[SwitchScopes.CREATE]} //
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