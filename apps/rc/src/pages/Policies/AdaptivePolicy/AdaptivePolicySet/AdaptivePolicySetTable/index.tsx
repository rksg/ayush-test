import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps }           from '@acx-ui/components'
import {
  useAdaptivePolicySetListQuery,
  useDeleteAdaptivePolicySetMutation, useLazyGetPrioritizedPoliciesQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicySet,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType, useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

function useColumns (policyCountMap: Map<string, string>) {
  const { $t } = useIntl()
  const columns: TableProps<AdaptivePolicySet>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={
              getPolicyDetailsLink({
                type: PolicyType.ADAPTIVE_POLICY_SET,
                oper: PolicyOperation.DETAIL,
                policyId: row.id!
              })}
          >{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Contained Policies' }),
      key: 'policyCount',
      dataIndex: 'policyCount',
      align: 'center',
      render: (_, row) => {
        return policyCountMap.get(row.id) ?? '0'
      }
    }
  ]
  return columns
}

export default function AdaptivePolicySetTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const [policyCountMap, setPolicyCountMap] = useState(new Map())
  // const [templateIdMap, setTemplateIdMap] = useState(new Map())

  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicySetListQuery,
    defaultPayload: {}
  })

  const [
    deletePolicy,
    { isLoading: isDeletePolicyUpdating }
  ] = useDeleteAdaptivePolicySetMutation()

  // eslint-disable-next-line max-len
  const [getPrioritizedPolicies, { isLoading: isGetPrioritizedPoliciesUpdating }] = useLazyGetPrioritizedPoliciesQuery()

  useEffect(() => {
    if (tableQuery.isLoading)
      return

    const policyCountMap = new Map()
    tableQuery.data?.data.forEach(policy => {
      const { id } = policy
      getPrioritizedPolicies({ params: { policySetId: id } })
        .then(result => {
          if (result.data) {
            policyCountMap.set(id, result.data.data.length)
          }
        })
    })
    setPolicyCountMap(policyCountMap)
  }, [tableQuery.data])

  const rowActions: TableProps<AdaptivePolicySet>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
          type: PolicyType.ADAPTIVE_POLICY_SET,
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
          entityName: $t({ defaultMessage: 'policy' }),
          entityValue: name,
          confirmationText: 'Delete'
        },
        onOk: async () => {
          deletePolicy({ params: { policySetId: id } })
            .unwrap()
            .then(() => {
              showToast({
                type: 'success',
                content: $t({ defaultMessage: 'Policy Set {name} was deleted' }, { name })
              })
              clearSelection()
            }).catch((error) => {
              showToast({
                type: 'error',
                content: error.data.message
              })
            })
        }
      })
    }
  }]

  return (
    <Loader states={[
      // eslint-disable-next-line max-len
      { isLoading: tableQuery.isLoading || isGetPrioritizedPoliciesUpdating, isFetching: isDeletePolicyUpdating }
    ]}>
      <Table
        columns={useColumns(policyCountMap)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }}
        actions={[{
          label: $t({ defaultMessage: 'Add Set' }),
          onClick: () => {
            navigate({
              ...tenantBasePath,
              pathname: `${tenantBasePath.pathname}/` + getPolicyRoutePath({
                type: PolicyType.ADAPTIVE_POLICY_SET,
                oper: PolicyOperation.CREATE
              })
            })
          }
        }]}
      />
    </Loader>
  )
}
