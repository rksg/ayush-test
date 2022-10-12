import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { usePolicyListQuery }                                             from '@acx-ui/rc/services'
import {
  useTableQuery,
  Policy,
  PolicyType,
  PolicyTechnology
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { policyTypeLabelMapping, policyTechnologyLabelMapping }            from '../contentsMap'
import { getPolicyDetailsLink, getSelectPolicyRoutePath, PolicyOperation } from '../policyRouteUtils'


function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<Policy>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: row.type as PolicyType,
              oper: PolicyOperation.DETAIL,
              policyId: row.id
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      sorter: true,
      render: function (data) {
        return $t(policyTypeLabelMapping[data as PolicyType])
      }
    },
    {
      key: 'technology',
      title: $t({ defaultMessage: 'Technology' }),
      dataIndex: 'technology',
      sorter: true,
      render: function (data) {
        return $t(policyTechnologyLabelMapping[data as PolicyTechnology])
      }
    },
    {
      key: 'scope',
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'scope',
      sorter: true,
      align: 'center'
    },
    {
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      sorter: true
    }
  ]

  return columns
}

const defaultPayload = {
  searchString: '',
  fields: [
    'check-all',
    'id',
    'name',
    'type',
    'technology',
    'scope',
    'cog',
    'health',
    'tags'
  ]
}

export function PoliciesTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const PoliciesTable = () => {
    const tableQuery = useTableQuery({
      useQuery: usePolicyListQuery,
      defaultPayload
    })

    const rowActions: TableProps<Policy>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Delete' }),
        onClick: ([{ id, name, type }]) => {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Policy' }),
              entityValue: name
            },
            onOk: () => {
              // TODO
              // eslint-disable-next-line no-console
              console.log('Delete policy: ', id, type)
            }
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Edit' }),
        onClick: ([{ type, id }]) => {
          navigate({
            ...tenantBasePath,
            pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
              type: type as PolicyType,
              oper: PolicyOperation.EDIT,
              policyId: id
            })
          })
        }
      }
    ]

    return (
      <Loader states={[tableQuery]}>
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
        title={$t({ defaultMessage: 'Policies' })}
        extra={[
          <TenantLink to={getSelectPolicyRoutePath(true)} key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add Policy' })}</Button>
          </TenantLink>
        ]}
      />
      <PoliciesTable />
    </>
  )
}
