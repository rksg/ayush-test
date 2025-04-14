import { Col, Form, Row, Space, Typography } from 'antd'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { Button, Card, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                                   from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListByQueryQuery,
  useGetRadiusAttributeGroupQuery,
  usePolicyTemplateListByQueryQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy,
  AttributeAssignment, filterByAccessForServicePolicyMutation,
  getAdaptivePolicyDetailLink, getPolicyAllowedOperation,
  getPolicyDetailsLink, getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType, useAdaptivePolicyBreadcrumb, useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

export default function RadiusAttributeGroupDetail () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { data, isFetching, isLoading } = useGetRadiusAttributeGroupQuery({ params: { policyId } })
  const { Paragraph } = Typography
  const breadcrumb = useAdaptivePolicyBreadcrumb(PolicyType.RADIUS_ATTRIBUTE_GROUP)

  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicyListByQueryQuery,
    apiParams: { excludeContent: 'false' },
    defaultPayload: {
      filters: { onMatchResponse: policyId }
    }
  })

  // eslint-disable-next-line max-len
  const { templateList } = usePolicyTemplateListByQueryQuery({ payload: { page: '1', pageSize: '1000' } }, {
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

  const getAttributes = function (attributes: Partial<AttributeAssignment> [] | undefined) {
    return attributes?.map((attribute, idx) => {
      return (
        <Col span={6} key={'attribute_' + idx}>
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
        defaultSortOrder: 'ascend',
        render: function (_, row) {
          return (
            <TenantLink
              to={getAdaptivePolicyDetailLink({
                oper: PolicyOperation.DETAIL,
                policyId: row.id!,
                templateId: templateList.get(row.policyType) ?? ''
              })}>{row.name}</TenantLink>
          )
        }
      },
      {
        title: $t({ defaultMessage: 'Adaptive Policy Set Membership' }),
        key: 'policySetCount',
        dataIndex: 'policySetCount',
        align: 'center',
        sorter: true,
        render: (_, row) => {
          const policySets = row.policySetNames ?? []
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
        breadcrumb={breadcrumb}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
              oper: PolicyOperation.EDIT,
              policyId: policyId!
            })}
            scopeKey={getScopeKeyByPolicy(PolicyType.RADIUS_ATTRIBUTE_GROUP, PolicyOperation.EDIT)}
            // eslint-disable-next-line max-len
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.RADIUS_ATTRIBUTE_GROUP, PolicyOperation.EDIT)}
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
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
