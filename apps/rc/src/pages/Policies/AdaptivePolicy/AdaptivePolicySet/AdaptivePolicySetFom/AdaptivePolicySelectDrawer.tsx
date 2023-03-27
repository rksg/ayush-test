import React, { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { Drawer, Loader, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                 from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListQuery, useAdaptivePolicySetListQuery,
  useLazyGetConditionsInPolicyQuery, useLazyGetPrioritizedPoliciesQuery,
  usePolicyTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy,
  getAdaptivePolicyDetailLink,
  PolicyOperation,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

interface AdaptivePoliciesSelectDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  setAdaptivePolicyDrawerVisible: (visible: boolean) => void
  accessPolicies: AdaptivePolicy []
  setAccessPolicies: (accessPolicies: AdaptivePolicy [] ) => void
}

export function AdaptivePoliciesSelectDrawer (props: AdaptivePoliciesSelectDrawerProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { setVisible, visible, setAdaptivePolicyDrawerVisible, accessPolicies, setAccessPolicies } = props

  const [conditionCountMap, setConditionCountMap] = useState(new Map())
  const [selectedPolicies, setSelectedPolicies] = useState(new Map())
  const [templateIdMap, setTemplateIdMap] = useState(new Map())
  const [policySetPoliciesMap, setPolicySetPoliciesMap] = useState(new Map())

  const [getConditionsPolicy] = useLazyGetConditionsInPolicyQuery()

  const { data: templateList, isLoading: templateIsLoading } =
    usePolicyTemplateListQuery({
      payload: {
        page: '1',
        pageSize: '1000',
        sortField: 'name',
        sortOrder: 'desc' }
    })

  const adaptivePolicyListTableQuery = useTableQuery({
    useQuery: useAdaptivePolicyListQuery,
    defaultPayload: {}
  })

  // eslint-disable-next-line max-len
  const { data: adaptivePolicySetList } = useAdaptivePolicySetListQuery({ payload: { page: '1', pageSize: '2147483647' } })

  const [getPrioritizedPolicies] = useLazyGetPrioritizedPoliciesQuery()

  useEffect(() => {
    if(adaptivePolicySetList) {
      adaptivePolicySetList.data.forEach(policySet => {
        getPrioritizedPolicies({ params: { policySetId: policySet.id } })
          .then(result => {
            if (result.data) {
              const policies : string []= result.data.data.map(p => p.policyId)
              setPolicySetPoliciesMap(map => new Map(map.set(policySet.name, policies)))
            }
          })
      })
    }
  }, [adaptivePolicySetList])

  useEffect(() => {
    if (!visible || adaptivePolicyListTableQuery.isLoading || templateIsLoading)
      return

    const templateIds = new Map()

    templateList?.data.forEach( template => {
      templateIds.set(template.ruleType, template.id)
    })
    setTemplateIdMap(templateIds)

    adaptivePolicyListTableQuery.data?.data.forEach(policy => {
      const { id, policyType } = policy
      getConditionsPolicy({ params: { policyId: id, templateId: templateIds.get(policyType) } })
        .then(result => {
          setConditionCountMap(map => new Map(map.set(id, result.data?.data.length ?? 0)))
        })
    })

    if(accessPolicies) {
      setSelectedPolicies(new Map(accessPolicies.map(item => [item.id, item])))
    }
  }, [adaptivePolicyListTableQuery.data, templateList?.data, visible])

  const onClose = () => {
    setVisible(false)
  }

  function useColumns () {
    const { $t } = useIntl()
    const columns: TableProps<AdaptivePolicy>['columns'] = [
      {
        title: $t({ defaultMessage: 'Name' }),
        key: 'name',
        dataIndex: 'name',
        searchable: true,
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
        key: 'policySetCount',
        dataIndex: 'policySetCount',
        align: 'center',
        render: (data, row) => {
          const policySets = [] as string []
          policySetPoliciesMap.forEach((value, key) => {
            if(value.find((item: string) => item === row.id)){
              policySets.push(key)
            }
          })
          return policySets.length === 0 ? '0' :
            <SimpleListTooltip items={policySets} displayText={policySets.length} />
        }
      },
      {
        title: $t({ defaultMessage: 'Select' }),
        dataIndex: 'select',
        key: 'activate',
        align: 'center',
        render: (data, row) => {
          return <Switch
            checked={
              // selectedPolicies.findIndex(item => item === row.id) !== -1
              selectedPolicies.has(row.id)
            }
            onChange={(checked) => onSelectChange(row, checked)}
          />
        }
      }
    ]
    return columns
  }

  const handleAdd = async () => {
    setAccessPolicies(Array.from(selectedPolicies.values()))
    setVisible(false)
  }

  const footer = (
    <Drawer.FormFooter
      onCancel={() => {
        onClose()
      }}
      buttonLabel={{
        save: $t({ defaultMessage: 'Add' })
      }}
      onSave={handleAdd}
    />
  )

  const onSelectChange = (policy: AdaptivePolicy, check: boolean) => {
    const newPolicies = new Map(selectedPolicies)
    if(check) {
      newPolicies.set(policy.id, policy)
    } else {
      newPolicies.delete(policy.id)
    }
    setSelectedPolicies(newPolicies)
  }

  const content = (
    <Form layout={'vertical'}>
      <Loader states={[
        adaptivePolicyListTableQuery
      ]}>
        <Form.Item
          label={$t({ defaultMessage: 'Select Access Policies' })}
        >
          <Table
            rowKey='id'
            columns={useColumns()}
            dataSource={adaptivePolicyListTableQuery.data?.data}
            pagination={adaptivePolicyListTableQuery.pagination}
            onChange={adaptivePolicyListTableQuery.handleTableChange}
            actions={[{
              label: $t({ defaultMessage: 'Add Policy' }),
              onClick: () => {
                setAdaptivePolicyDrawerVisible(true)
              }
            }]}
          />
        </Form.Item>
      </Loader>
    </Form>
  )

  return (
    <Drawer
      title={$t({ defaultMessage: 'Select Access Policies' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      width={600}
    />
  )
}
