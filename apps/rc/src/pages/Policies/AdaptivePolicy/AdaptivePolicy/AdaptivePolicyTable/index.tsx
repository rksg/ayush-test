import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps }  from '@acx-ui/components'
import {
  useAdaptivePolicyListQuery,
  useDeleteAdaptivePolicyMutation,
  useLazyGetConditionsInPolicyQuery, usePolicyTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy,
  getAdaptivePolicyDetailLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType, useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

function useColumns (conditionsMap: Map<string, string>, templateIdMap: Map<string, string>) {
  const { $t } = useIntl()
  const columns: TableProps<AdaptivePolicy>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          // eslint-disable-next-line max-len
          <TenantLink
            to={
              getAdaptivePolicyDetailLink({
                oper: PolicyOperation.DETAIL,
                policyId: row.id!,
                templateId: templateIdMap.get(row.policyType) ?? ''
              })}
          >{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Access Conditions' }),
      key: 'accessConditions',
      dataIndex: 'accessConditions',
      align: 'center',
      render: (_, row) => {
        return conditionsMap.get(row.id) ?? '0'
      }
    },
    {
      title: $t({ defaultMessage: 'Policy Set Membership' }),
      key: 'policySetCount',
      dataIndex: 'policySetCount',
      align: 'center',
      render: function () {
        return '0'
      }
    }
  ]
  return columns
}

export default function AdaptivePolicyTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const [conditionCountMap, setConditionCountMap] = useState(new Map())
  const [templateIdMap, setTemplateIdMap] = useState(new Map())

  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicyListQuery,
    defaultPayload: {}
  })

  // eslint-disable-next-line max-len
  const { data: templateList, isLoading: templateIsLoading } = usePolicyTemplateListQuery({ payload: { page: '1', pageSize: '2147483647' } })

  const [
    deletePolicy,
    { isLoading: isDeletePolicyUpdating }
  ] = useDeleteAdaptivePolicyMutation()

  const [getConditionsPolicy] = useLazyGetConditionsInPolicyQuery()

  useEffect(() => {
    if (tableQuery.isLoading || templateIsLoading)
      return

    const templateIds = new Map()
    templateList?.data.forEach( template => {
      templateIds.set(template.ruleType, template.id)
    })
    setTemplateIdMap(templateIds)

    const conditionPools = new Map()
    tableQuery.data?.data.forEach(policy => {
      const { id, policyType } = policy
      getConditionsPolicy({ params: { policyId: id, templateId: templateIds.get(policyType) } })
        .then(result => {
          if (result.data) {
            conditionPools.set(id, result.data.data.length)
          }
        })
    })
    setConditionCountMap(conditionPools)
  }, [tableQuery.data, templateList?.data])

  const rowActions: TableProps<AdaptivePolicy>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getAdaptivePolicyDetailLink({
          oper: PolicyOperation.EDIT,
          policyId: selectedRows[0].id!,
          templateId: templateIdMap.get(selectedRows[0].policyType)
        })
      })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([{ name, id, policyType }], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'policy' }),
          entityValue: name,
          confirmationText: 'Delete'
        },
        onOk: async () => {
          deletePolicy({ params: { policyId: id, templateId: templateIdMap.get(policyType) } })
            .unwrap()
            .then(() => {
              showToast({
                type: 'success',
                content: $t({ defaultMessage: 'Policy {name} was deleted' }, { name })
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
      tableQuery,
      { isLoading: false, isFetching: isDeletePolicyUpdating }
    ]}>
      <Table
        columns={useColumns(conditionCountMap, templateIdMap)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }}
        actions={[{
          label: $t({ defaultMessage: 'Add Policy' }),
          onClick: () => {
            navigate({
              ...tenantBasePath,
              pathname: `${tenantBasePath.pathname}/` + getPolicyRoutePath({
                type: PolicyType.ADAPTIVE_POLICY,
                oper: PolicyOperation.CREATE
              })
            })
          }
        }]}
      />
    </Loader>
  )
}
