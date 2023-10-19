import React, { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { Drawer, Loader, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                 from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListByQueryQuery,
  usePolicyTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy, FILTER,
  getAdaptivePolicyDetailLink,
  PolicyOperation, SEARCH,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { AdaptivePolicyFormDrawer } from './AdaptivePolicyFormDrawer'

interface AdaptivePoliciesSelectDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  accessPolicies: AdaptivePolicy []
  setAccessPolicies: (accessPolicies: AdaptivePolicy [] ) => void
}

export function AdaptivePoliciesSelectDrawer (props: AdaptivePoliciesSelectDrawerProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { setVisible, visible, accessPolicies, setAccessPolicies } = props

  const [adaptivePolicyDrawerVisible, setAdaptivePolicyDrawerVisible] = useState(false)
  const [selectedPolicies, setSelectedPolicies] = useState(new Map())

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

  const adaptivePolicyListTableQuery = useTableQuery({
    useQuery: useAdaptivePolicyListByQueryQuery,
    apiParams: { sort: 'name,ASC', excludeContent: 'false' },
    defaultPayload: {}
  })

  useEffect(() => {
    if (!visible || adaptivePolicyListTableQuery.isLoading)
      return

    if(accessPolicies && selectedPolicies.size === 0) {
      setSelectedPolicies(new Map(accessPolicies.map(item => [item.id, item])))
    }
  }, [adaptivePolicyListTableQuery.data, visible])

  const onClose = () => {
    setSelectedPolicies(new Map())
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
        sorter: true,
        defaultSortOrder: 'ascend',
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
        align: 'center',
        sorter: true
      },
      {
        title: $t({ defaultMessage: 'Policy Set Membership' }),
        key: 'policySetCount',
        dataIndex: 'policySetCount',
        sorter: true,
        render: (_, row) => {
          const policySets = row.policySetNames ?? []
          return policySets.length === 0 ? '0' :
            <SimpleListTooltip items={policySets} displayText={policySets.length} />
        }
      },
      {
        title: $t({ defaultMessage: 'Select' }),
        dataIndex: 'select',
        key: 'activate',
        align: 'center',
        render: (_, row) => {
          return <Switch
            checked={selectedPolicies.has(row.id)}
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

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = { ...adaptivePolicyListTableQuery.payload,
      filters: { name: customSearch?.searchString ?? '' } }
    adaptivePolicyListTableQuery.setPayload(payload)
  }

  const content = (
    <Form layout={'vertical'}>
      <Loader states={[
        adaptivePolicyListTableQuery,
        { isLoading: templateIsLoading }
      ]}>
        <Form.Item
          label={$t({ defaultMessage: 'Select Access Policies' })}
        >
          <Table
            enableApiFilter
            rowKey='id'
            columns={useColumns()}
            dataSource={adaptivePolicyListTableQuery.data?.data}
            pagination={adaptivePolicyListTableQuery.pagination}
            onChange={adaptivePolicyListTableQuery.handleTableChange}
            onFilterChange={handleFilterChange}
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
    <>
      <Drawer
        title={$t({ defaultMessage: 'Select Access Policies' })}
        visible={visible}
        onClose={onClose}
        children={content}
        footer={footer}
        width={600}
      />
      <AdaptivePolicyFormDrawer
        visible={adaptivePolicyDrawerVisible}
        setVisible={setAdaptivePolicyDrawerVisible}
      />
    </>
  )
}
