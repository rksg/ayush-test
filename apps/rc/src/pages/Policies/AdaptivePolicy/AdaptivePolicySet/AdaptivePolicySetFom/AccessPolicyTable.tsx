import React, { useEffect, useState } from 'react'

import { useIntl }                                                                                          from 'react-intl'
import { useParams }                                                                                        from 'react-router-dom'
import { SortableContainer, SortableElement, SortableHandle, SortableElementProps, SortableContainerProps } from 'react-sortable-hoc'

import { Loader, Table, TableProps }                              from '@acx-ui/components'
import { Drag }                                                   from '@acx-ui/icons'
import {
  useAdaptivePolicyListQuery,
  useGetPrioritizedPoliciesQuery,
  useLazyGetConditionsInPolicyQuery, usePolicyTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy,
  getAdaptivePolicyDetailLink,
  PolicyOperation, useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

type AccessPolicyTableProps = {
  editMode: boolean
  setAdaptivePoliciesSelectDrawerVisible: (visible: boolean) => void
  accessPolicies: AdaptivePolicy []
  setAccessPolicies: (accessPolicies: AdaptivePolicy [] ) => void
}

const AccessPolicyTable = (props: AccessPolicyTableProps) => {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { editMode, setAdaptivePoliciesSelectDrawerVisible, accessPolicies, setAccessPolicies } = props
  const { policyId } = useParams()

  const [conditionCountMap, setConditionCountMap] = useState(new Map())
  const [templateIdMap, setTemplateIdMap] = useState(new Map())

  const [getConditionsPolicy] = useLazyGetConditionsInPolicyQuery()

  const { data: templateList } = usePolicyTemplateListQuery({ payload: {
    page: '1',
    pageSize: '1000',
    sortField: 'name',
    sortOrder: 'desc' }
  })

  // eslint-disable-next-line max-len
  const { data: prioritizedPoliciesData, isLoading: isGetPrioritizedPoliciesLoading } = useGetPrioritizedPoliciesQuery({
    params: { policySetId: policyId } }, { skip: !editMode })

  const adaptivePolicyListTableQuery = useTableQuery({
    useQuery: useAdaptivePolicyListQuery,
    defaultPayload: {},
    pagination: {
      pageSize: 10000,
      page: 1
    }
  })

  useEffect(() => {
    if(!adaptivePolicyListTableQuery.data || !prioritizedPoliciesData?.data)
      return

    const accessPolicy = [] as AdaptivePolicy []
    const allPolicyList = adaptivePolicyListTableQuery.data?.data
    const templateIds = new Map()
    templateList?.data.forEach( template => {
      templateIds.set(template.ruleType, template.id)
    })
    setTemplateIdMap(templateIds)

    const conditionCountMap = new Map()
    prioritizedPoliciesData?.data.forEach(policy => {
      const { policyId } = policy
      const findPolicy = allPolicyList.find(p => p.id === policyId)
      if(findPolicy) {
        accessPolicy.push(findPolicy)
        // eslint-disable-next-line max-len
        getConditionsPolicy({ params: { policyId: policyId, templateId: templateIds.get(findPolicy.policyType) } })
          .unwrap()
          .then(result => {
            conditionCountMap.set(policyId, result.data.length ?? 0)
          })
      }
    })
    setConditionCountMap(conditionCountMap)
    setAccessPolicies(accessPolicy)
  }, [adaptivePolicyListTableQuery.data, prioritizedPoliciesData?.data])

  const DragHandle = SortableHandle(() =>
    <Drag style={{ cursor: 'grab', color: '#6e6e6e' }} />
  )

  const basicColumns: TableProps<AdaptivePolicy>['columns'] = [
    {
      key: 'index',
      dataIndex: 'index',
      align: 'center',
      render: (_, row, index) => {
        return index + 1
      }
    },
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      render: function (data, row) {
        return (
          <TenantLink
            to={
              getAdaptivePolicyDetailLink({
                oper: PolicyOperation.DETAIL,
                policyId: row.id!,
                templateId: templateIdMap.get(row.policyType) ?? ''
              })}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Access Conditions' }),
      key: 'accessConditions',
      dataIndex: 'accessConditions',
      align: 'center',
      render: (data, row) => {
        return conditionCountMap.get(row.id) ?? 0
      }
    },
    {
      title: $t({ defaultMessage: 'Policy Set Membership' }),
      key: 'policySetMembership',
      dataIndex: 'policySetMembership',
      align: 'center',
      render: function () {
        return '0'
      }
    },
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
      render: (data, row) => {
        return <div data-testid={`${row.name}_Icon`} style={{ textAlign: 'center' }}>
          <DragHandle/>
        </div>
      }
    }
  ]

  const actions = [{
    label: $t({ defaultMessage: 'Select Policies' }),
    onClick: () => {
      setAdaptivePoliciesSelectDrawerVisible(true)
    }
  }]

  // @ts-ignore
  const SortableItem = SortableElement((props: SortableElementProps) => <tr {...props} />)
  // @ts-ignore
  const SortContainer = SortableContainer((props: SortableContainerProps) => <tbody {...props} />)

  const DraggableContainer = (props: SortableContainerProps) => {
    return <SortContainer
      useDragHandle
      disableAutoscroll
      onSortEnd={({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        const dragAndDropItems = [...accessPolicies] as AdaptivePolicy[]
        [dragAndDropItems[oldIndex], dragAndDropItems[newIndex]] =
          [dragAndDropItems[newIndex], dragAndDropItems[oldIndex]]
        setAccessPolicies(dragAndDropItems.map((policy, i) => {
          return {
            ...policy,
            priority: i + 1
          }
        }))
      }}
      {...props}
    />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DraggableBodyRow = (props: any) => {
    const { className, style, ...restProps } = props
    const index = accessPolicies.findIndex((x) => x.name === restProps['data-row-key'])
    return <SortableItem index={index} {...restProps} />
  }

  return (
    <Loader states={[{ isLoading: adaptivePolicyListTableQuery.isLoading
        || isGetPrioritizedPoliciesLoading } ]}>
      <Table
        rowKey='name'
        columns={basicColumns}
        dataSource={accessPolicies}
        actions={filterByAccess(actions)}
        components={{
          body: {
            wrapper: DraggableContainer,
            row: DraggableBodyRow
          }
        }}
        columnState={{ hidden: true }}
      />
    </Loader>
  )
}

export default AccessPolicyTable
