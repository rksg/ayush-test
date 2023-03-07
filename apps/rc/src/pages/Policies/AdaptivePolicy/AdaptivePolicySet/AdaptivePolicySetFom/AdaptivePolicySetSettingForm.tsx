import React, { useEffect, useState } from 'react'

import { Col, Form, Input, Row, Switch } from 'antd'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { Loader, Table, TableProps } from '@acx-ui/components'
import {
  useAdaptivePolicyListQuery,
  useLazyAdaptivePolicySetLisByQueryQuery, useLazyGetConditionsInPolicyQuery,
  usePolicyTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy,
  checkObjectNotExists,
  getAdaptivePolicyDetailLink,
  PolicyOperation, PrioritizedPolicy,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { AdaptivePolicyFormDrawer } from './AdaptivePolicyFormDrawer'

export function AdaptivePolicySetSettingForm () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const form = Form.useFormInstance()

  const accessPolicies = Form.useWatch('accessPolicies')
  const accessDeletePolicies = Form.useWatch('accessDeletePolicies')

  const [conditionCountMap, setConditionCountMap] = useState(new Map())
  const [templateIdMap, setTemplateIdMap] = useState(new Map())
  const [adaptivePolicyDrawerVisible, setAdaptivePolicyDrawerVisible] = useState(false)

  // eslint-disable-next-line max-len
  const { data: templateList, isLoading: templateIsLoading } = usePolicyTemplateListQuery({ payload: { page: '1', pageSize: '2147483647' } })

  const [getConditionsPolicy] = useLazyGetConditionsInPolicyQuery()


  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicyListQuery,
    defaultPayload: {},
    pagination: { pageSize: 10000, page: 1 }
  })

  const [getPolicySetList] = useLazyAdaptivePolicySetLisByQueryQuery()

  const onSelectChange = (policyId: string, value: boolean) => {
    const newAccessPolicies: PrioritizedPolicy [] =
      accessPolicies ? accessPolicies.slice() : []
    const newDeleteAccessPolicies: PrioritizedPolicy [] =
      accessDeletePolicies ? accessDeletePolicies.slice() : []
    if(value) {
      newAccessPolicies.push({ policyId })

      // eslint-disable-next-line max-len
      const targetIdx = newDeleteAccessPolicies.findIndex((r: PrioritizedPolicy) => r.policyId === policyId)
      newDeleteAccessPolicies.splice(targetIdx, 1)
    } else {
      // eslint-disable-next-line max-len
      const targetIdx = newAccessPolicies.findIndex((r: PrioritizedPolicy) => r.policyId === policyId)
      newAccessPolicies.splice(targetIdx, 1)

      newDeleteAccessPolicies.push({ policyId })
    }
    form.setFieldValue('accessPolicies', newAccessPolicies)
    form.setFieldValue('accessDeletePolicies', newDeleteAccessPolicies)
  }

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

  const nameValidator = async (value: string) => {
    const list = (await getPolicySetList({
      params: {
        excludeContent: 'false'
      },
      payload: {
        fields: [ 'name' ],
        page: 1, pageSize: 10,
        filters: { name: value }
      }
    }).unwrap()).data.filter(n => n.id !== policyId).map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'Adaptive Policy Set' }))
  }

  // eslint-disable-next-line max-len
  function useColumns (conditionsMap: Map<string, string>, templateIdMap: Map<string, string>) {
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
      },
      {
        title: $t({ defaultMessage: 'Select' }),
        dataIndex: 'select',
        key: 'activate',
        align: 'center',
        render: (data, row) => {
          return <Switch
            checked={
              // eslint-disable-next-line max-len
              accessPolicies ? accessPolicies.findIndex((item: PrioritizedPolicy) => item.policyId === row.id) !== -1 : false
            }
            onChange={(checked) => onSelectChange(row.id, checked)}
          />
        }
      }
    ]
    return columns
  }

  return (
    <>
      <Row>
        <Col span={10}>
          <Form.Item name='name'
            label={$t({ defaultMessage: 'Policy Name' })}
            rules={[
              { required: true },
              { validator: (_, value) => nameValidator(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input/>}
          />
        </Col>
        <Form.Item
          name='accessDeletePolicies'
          hidden
          children={<Input/>}
        />
        <Col span={24}>
          <Loader states={[tableQuery]}>
            <Form.Item
              name='accessPolicies'
              label={$t({ defaultMessage: 'Select Access Policies' })}
              rules={[
                { required: true }
              ]}
            >
              <Table
                rowKey='id'
                columns={useColumns(conditionCountMap, templateIdMap)}
                dataSource={tableQuery.data?.data}
                actions={[{
                  label: $t({ defaultMessage: 'Add Policy' }),
                  onClick: () => {
                    setAdaptivePolicyDrawerVisible(true)
                  }
                }]}
              />
            </Form.Item>
          </Loader>
        </Col>
      </Row>
      <AdaptivePolicyFormDrawer
        visible={adaptivePolicyDrawerVisible}
        setVisible={setAdaptivePolicyDrawerVisible}
      />
    </>
  )
}
