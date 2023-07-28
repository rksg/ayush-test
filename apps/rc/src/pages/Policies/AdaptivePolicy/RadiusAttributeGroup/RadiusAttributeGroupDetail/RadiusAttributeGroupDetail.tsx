import React, { useEffect, useState } from 'react'

import { Col, Form, Row, Space, Typography } from 'antd'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { Button, Card, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                                   from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListByQueryQuery,
  useAdaptivePolicySetListQuery,
  useGetRadiusAttributeGroupQuery,
  useLazyGetPrioritizedPoliciesQuery,
  usePolicyTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy,
  AttributeAssignment, getAdaptivePolicyDetailLink,
  getPolicyDetailsLink, getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType, useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

export default function RadiusAttributeGroupDetail () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { data, isFetching, isLoading } = useGetRadiusAttributeGroupQuery({ params: { policyId } })
  const { Paragraph } = Typography
  const [policySetPoliciesMap, setPolicySetPoliciesMap] = useState(new Map())
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST })

  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicyListByQueryQuery,
    apiParams: { excludeContent: 'false' },
    defaultPayload: {
      filters: { onMatchResponse: policyId }
    }
  })

  // eslint-disable-next-line max-len
  const { data: adaptivePolicySetList } = useAdaptivePolicySetListQuery({ payload: { page: '1', pageSize: '2147483647' } })

  const [getPrioritizedPolicies] = useLazyGetPrioritizedPoliciesQuery()

  // eslint-disable-next-line max-len
  const { templateList } = usePolicyTemplateListQuery({ payload: { page: '1', pageSize: '2147483647' } }, {
    selectFromResult ({ data }) {
      const templateIds = new Map()
      data?.data.forEach( template => {
        templateIds.set(template.ruleType, template.id)
      })
      return {
        templateList: templateIds
      }
    }
  })

  useEffect(() => {
    if(!adaptivePolicySetList) return
    adaptivePolicySetList.data.forEach(policySet => {
      getPrioritizedPolicies({ params: { policySetId: policySet.id } })
        .then(result => {
          if (result.data) {
            const policies : string []= result.data.data.map(p => p.policyId)
            setPolicySetPoliciesMap(map => new Map(map.set(policySet.name, policies)))
          }
        })
    })
  }, [adaptivePolicySetList])

  const getAttributes = function (attributes: Partial<AttributeAssignment> [] | undefined) {
    return attributes?.map((attribute) => {
      return (
        <Col span={6} key={attribute.attributeName}>
          <Form.Item
            label={attribute.attributeName}>
            <Paragraph>{attribute.attributeValue}</Paragraph>
          </Form.Item>
        </Col>
      )
    }) ?? []
  }

  function useColumns () {
    const { $t } = useIntl()
    const columns: TableProps<AdaptivePolicy>['columns'] = [
      {
        key: 'name',
        title: $t({ defaultMessage: 'Adaptive Policy Name' }),
        dataIndex: 'name',
        sorter: true,
        render: function (data, row) {
          return (
            <TenantLink
              to={getAdaptivePolicyDetailLink({
                oper: PolicyOperation.DETAIL,
                policyId: row.id!,
                templateId: templateList.get(row.policyType) ?? ''
              })}>{data}</TenantLink>
          )
        }
      },
      {
        title: $t({ defaultMessage: 'Adaptive Policy Set Membership' }),
        key: 'policySetMemberShip',
        dataIndex: 'policySetMemberShip',
        align: 'center',
        render: (_, row) => {
          const policySets = [] as string []
          policySetPoliciesMap.forEach((value, key) => {
            if(value.find((item: string) => item === row.id)){
              policySets.push(key)
            }
          })
          return policySets.length === 0 ? '0' :
            <SimpleListTooltip items={policySets} displayText={policySets.length} />
        }
      }
    ]

    return columns
  }

  return (
    <>
      <PageHeader
        title={data?.name || ''}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'RADIUS Attribute Groups' }),
            link: tablePath }
        ]}
        extra={[
          <TenantLink
            key='edit'
            to={getPolicyDetailsLink({
              type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
              oper: PolicyOperation.EDIT,
              policyId: policyId!
            })}
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
      />
      <Space direction={'vertical'}>
        <Card>
          <Loader states={[{ isLoading, isFetching }]}>
            <Form layout={'vertical'}>
              <Row>
                <Col span={6}>
                  <Form.Item label={$t({ defaultMessage: 'Group Name' })}>
                    <Paragraph>{data?.name}</Paragraph>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={$t({ defaultMessage: 'Members' })}
                  >
                    <Paragraph>{tableQuery.data?.totalCount ?? 0}</Paragraph>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Paragraph>{$t({ defaultMessage: 'RADIUS Attributes' })}</Paragraph>
                </Col>
                {getAttributes(data?.attributeAssignments)}
              </Row>
            </Form>
          </Loader>
        </Card>
        <Loader states={[tableQuery]}>
          <Card title={$t({ defaultMessage: 'Instance ({size})' },
            { size: tableQuery.data?.totalCount })}>
            <div style={{ width: '100%' }}>
              <Table
                rowKey='id'
                columns={useColumns()}
                dataSource={tableQuery.data?.data}
                pagination={tableQuery.pagination}
                onChange={tableQuery.handleTableChange}
              />
            </div>
          </Card>
        </Loader>
      </Space>
    </>
  )
}
