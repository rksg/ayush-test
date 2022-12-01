import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { useDeleteMacRegListMutation, useMacRegListsQuery } from '@acx-ui/rc/services'
import { MacRegistrationPool, useMacRegListTableQuery }     from '@acx-ui/rc/utils'
import { TenantLink, useNavigate }                          from '@acx-ui/react-router-dom'


function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<MacRegistrationPool>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: function (data, row) {
        return (
          // eslint-disable-next-line max-len
          <TenantLink to={`policies/mac-registration-lists/${row.id}/mac-registration-lists-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Mac Addresses' }),
      key: 'registrationCount',
      dataIndex: 'registrationCount',
      align: 'center',
      render: function (data, row) {
        return row.registrationCount
      }
    }
    // {
    //   key: 'scope',
    //   dataIndex: 'scope',
    //   title: $t({ defaultMessage: 'Scope' }),
    //   align: 'center',
    //   render: function (data, row) {
    //     return ''
    //   }
    // }
  ]
  return columns
}

export default function MacRegistrationListsTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()

  const MacRegistrationListsTable = () => {
    const tableQuery = useMacRegListTableQuery({
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
        navigate(`${selectedRows[0].id}/edit`, { replace: false })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Lists' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length,
            confirmationText: 'Delete'
          },
          onOk: () => {
            deleteMacRegList({ params: { macRegistrationListId: rows[0].id } })
              .then(clearSelection)
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
          dataSource={tableQuery.data?.content}
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
              link: '/policies' }
          ]}
        title={$t({ defaultMessage: 'MAC Registration Lists' })}
        extra={[
          <TenantLink to='/policies/mac-registration-lists/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add Policy' }) }</Button>
          </TenantLink>
        ]}
      />
      <MacRegistrationListsTable />
    </>
  )
}
