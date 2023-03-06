import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal, showToast
} from '@acx-ui/components'
import { useDeleteMacRegListMutation, useMacRegListsQuery } from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  MacRegistrationDetailsTabKey,
  MacRegistrationPool,
  PolicyOperation,
  PolicyType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { returnExpirationString } from '../MacRegistrationListUtils'


function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<MacRegistrationPool>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row, _, highlightFn) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.MAC_REGISTRATION_LIST,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!,
              activeTab: MacRegistrationDetailsTabKey.OVERVIEW
            })}
          >{highlightFn(data as string)}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'List Expiration' }),
      key: 'listExpiration',
      dataIndex: 'listExpiration',
      render: function (data, row) {
        return returnExpirationString(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Default Access' }),
      key: 'defaultAccess',
      dataIndex: 'defaultAccess'
    },
    {
      title: $t({ defaultMessage: 'Access Policy Set' }),
      key: 'policySet',
      dataIndex: 'policySet',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'MAC Addresses' }),
      key: 'registrationCount',
      dataIndex: 'registrationCount',
      align: 'center',
      render: function (data, row) {
        return row.registrationCount ?? 0
      }
    }
  ]
  return columns
}

export default function MacRegistrationListsTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const MacRegistrationListsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useMacRegListsQuery,
      defaultPayload: {}
    })

    const [
      deleteMacRegList,
      { isLoading: isDeleteMacRegListUpdating }
    ] = useDeleteMacRegListMutation()

    const rowActions: TableProps<MacRegistrationPool>['rowActions'] = [{
      visible: (selectedRows) => selectedRows.length === 1,
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
      onClick: ([{ name, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'List' }),
            entityValue: name,
            confirmationText: 'Delete'
          },
          onOk: () => {
            deleteMacRegList({ params: { policyId: id } })
              .unwrap()
              .then(() => {
                showToast({
                  type: 'success',
                  content: $t({ defaultMessage: 'List {name} was deleted' }, { name })
                })
                clearSelection()
              }).catch((error) => {
                console.log(error) // eslint-disable-line no-console
              })
          }
        })
      }
    }]

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteMacRegListUpdating }
      ]}>
        <Table
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        breadcrumb={
          [
            { text: $t({ defaultMessage: 'Policies & Profiles' }),
              link: getPolicyListRoutePath(true) }
          ]}
        title={$t({ defaultMessage: 'MAC Registration Lists' })}
        extra={[
          <TenantLink
            key='add'
            // eslint-disable-next-line max-len
            to={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })}
          >
            <Button type='primary'>{ $t({ defaultMessage: 'Add MAC Registration List' }) }</Button>
          </TenantLink>
        ]}
      />
      <MacRegistrationListsTable />
    </>
  )
}
