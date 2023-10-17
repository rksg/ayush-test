import React, { useEffect, useRef, useState } from 'react'

import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend }                  from 'react-dnd-html5-backend'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { Drag }                      from '@acx-ui/icons'
import { SimpleListTooltip }         from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListQuery,
  useGetPrioritizedPoliciesQuery,
  usePolicyTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy,
  getAdaptivePolicyDetailLink,
  PolicyOperation, useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { AdaptivePoliciesSelectDrawer } from './AdaptivePolicySelectDrawer'

type AccessPolicyTableProps = {
  editMode: boolean
  accessPolicies: AdaptivePolicy []
  setAccessPolicies: (accessPolicies: AdaptivePolicy [] ) => void
}

type DragItemProps = {
  name: string
}

const AccessPolicyTable = (props: AccessPolicyTableProps) => {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { editMode, accessPolicies, setAccessPolicies } = props
  const { policyId } = useParams()


  // eslint-disable-next-line max-len
  const [adaptivePoliciesSelectDrawerVisible, setAdaptivePoliciesSelectDrawerVisible] = useState(false)

  const { templateIdMap, templateIsLoading } = usePolicyTemplateListQuery(
    { payload: { page: '1', pageSize: '2147483647' } }, {
      selectFromResult: ({ data, isLoading }) => {
        const templateIds = new Map(data?.data.map((template) =>
          [template.ruleType.toString(), template.id]))
        return {
          templateIdMap: templateIds,
          templateIsLoading: isLoading
        }
      }
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
    // eslint-disable-next-line max-len
    if(adaptivePolicyListTableQuery.isLoading || isGetPrioritizedPoliciesLoading)
      return

    const accessPolicy: AdaptivePolicy[] = []
    Array.from(prioritizedPoliciesData?.data ?? []).sort((p1, p2) => p1.priority - p2.priority)
      .forEach(item => {
        const policy = adaptivePolicyListTableQuery.data?.data.find(p => p.id === item.policyId)
        if(policy) {
          accessPolicy.push(policy)
        }
      })
    setAccessPolicies(accessPolicy)
  }, [adaptivePolicyListTableQuery.data, prioritizedPoliciesData?.data])

  const basicColumns: TableProps<AdaptivePolicy>['columns'] = [
    {
      key: 'priority',
      dataIndex: 'priority',
      align: 'center',
      render: (_, __, index) => {
        return index + 1
      }
    },
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      render: function (_, row) {
        return (
          <TenantLink
            to={
              getAdaptivePolicyDetailLink({
                oper: PolicyOperation.DETAIL,
                policyId: row.id!,
                templateId: templateIdMap.get(row.policyType) ?? ''
              })}>{row.name}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Access Conditions' }),
      key: 'conditionsCount',
      dataIndex: 'conditionsCount',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Policy Set Membership' }),
      key: 'policySetMembership',
      dataIndex: 'policySetMembership',
      render: (_, row) => {
        const policySets = row.policySetNames ?? []
        return policySets.length === 0 ? '0' :
          <SimpleListTooltip items={policySets} displayText={policySets.length} />
      }
    },
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
      render: (_, row) => {
        return <div data-testid={`${row.name}_Icon`} style={{ textAlign: 'center' }}>
          <Drag style={{ cursor: 'grab', color: '#6e6e6e' }} />
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
  const DraggableRow = (props) => {
    const ref = useRef(null)
    const { className, onClick, ...restProps } = props

    const getAccessPolicyIndex = (name: string) => {
      return accessPolicies.findIndex((x) => x.name === name)
    }

    const [, drag] = useDrag(() => ({
      type: 'DraggableRow',
      item: {
        name: props['data-row-key']
      },
      collect: monitor => ({
        isDragging: monitor.isDragging()
      })
    }))

    const [{ isOver }, drop] = useDrop({
      accept: 'DraggableRow',
      drop: (item: DragItemProps) => {
        // @ts-ignore
        const newIndex = getAccessPolicyIndex(ref.current.getAttribute('data-row-key'))
        const oldIndex = getAccessPolicyIndex(item.name)
        if (newIndex !== oldIndex) {
          const dragAndDropItems = [...accessPolicies] as AdaptivePolicy[]
          [dragAndDropItems[oldIndex], dragAndDropItems[newIndex]] =
            [dragAndDropItems[newIndex], dragAndDropItems[oldIndex]]
          setAccessPolicies(dragAndDropItems.map((policy, i) => {
            return {
              ...policy,
              priority: i + 1
            }
          }))
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
    })

    drag(drop(ref))

    return (
      <tr
        ref={ref}
        className={className}
        onClick={onClick}
        {...restProps}
        style={isOver ? {
          backgroundColor: 'var(--acx-accents-blue-10)',
          borderColor: 'var(--acx-accents-blue-10)'
        } : {}}
      >
        {props.children}
      </tr>
    )
  }

  return (
    <Loader states={[{ isLoading: adaptivePolicyListTableQuery.isLoading
        || isGetPrioritizedPoliciesLoading || templateIsLoading } ]}>
      <DndProvider backend={HTML5Backend} >
        <Table
          rowKey='name'
          columns={basicColumns}
          dataSource={accessPolicies}
          actions={filterByAccess(actions)}
          components={{
            body: {
              row: DraggableRow
            }
          }}
        />
      </DndProvider>
      <AdaptivePoliciesSelectDrawer
        visible={adaptivePoliciesSelectDrawerVisible}
        setVisible={setAdaptivePoliciesSelectDrawerVisible}
        accessPolicies={accessPolicies}
        setAccessPolicies={setAccessPolicies}/>
    </Loader>
  )
}

export default AccessPolicyTable
