import { useEffect, useState } from 'react'

import { Col, Form, Row, Space, Typography } from 'antd'
import moment                                from 'moment'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { Button, PageHeader, SummaryCard } from '@acx-ui/components'
import {
  useGetAdaptivePolicyQuery,
  useGetConditionsInPolicyQuery,
  useLazyGetRadiusAttributeGroupQuery
} from '@acx-ui/rc/services'
import {
  AccessCondition,
  CriteriaOption,
  PolicyOperation,
  PolicyType,
  getAdaptivePolicyDetailLink,
  useAdaptivePolicyBreadcrumb,
  filterByAccessForServicePolicyMutation, getScopeKeyByPolicy, getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

export default function AdaptivePolicyDetail () {
  const { $t } = useIntl()
  const { policyId, templateId } = useParams()
  const { Paragraph } = Typography
  const [attributeGroupName, seAttributeGroupName] = useState('' as string)
  const breadcrumb = useAdaptivePolicyBreadcrumb(PolicyType.ADAPTIVE_POLICY)
  // eslint-disable-next-line max-len
  const { data: policyData, isLoading: isGetAdaptivePolicyLoading }= useGetAdaptivePolicyQuery({ params: { templateId, policyId } })

  // eslint-disable-next-line max-len
  const { data: conditionsData, isLoading: isGetConditionsLoading } = useGetConditionsInPolicyQuery({
    payload: { page: '1', pageSize: '2147483647' },
    params: { policyId, templateId } })

  const [getAttributeGroup] = useLazyGetRadiusAttributeGroupQuery()

  useEffect(() => {
    if(!policyData) return
    getAttributeGroup({ params: { policyId: policyData.onMatchResponse } }).then(result => {
      if (result.data) {
        seAttributeGroupName(result.data.name)
      }
    })
  }, [policyData])

  const getConditions = function (conditions : AccessCondition [] | undefined) {
    return conditions?.map(((condition) => {
      // eslint-disable-next-line max-len
      const criteria = condition.evaluationRule.criteriaType === CriteriaOption.DATE_RANGE ?
        // eslint-disable-next-line max-len
        `${condition.evaluationRule?.when}, ${moment(condition.evaluationRule.startTime, 'HH:mm:ss').format('h:mm A')} - ${moment(condition.evaluationRule.endTime, 'HH:mm:ss').format('h:mm A')}, ${condition.evaluationRule.zoneOffset}`
        : condition.evaluationRule.regexStringCriteria
      return (
        <Col span={6} key={condition.id}>
          <Form.Item>
            <SummaryCard.Item
              //eslint-disable-next-line max-len
              title={condition.templateAttribute?.attributeType === 'DATE_RANGE' ? condition.templateAttribute?.name :
                //eslint-disable-next-line max-len
                $t({ defaultMessage: '{category, select, identity {Identity Name/} other {}}{name} (Regex)' },
                  //eslint-disable-next-line max-len
                  { name: condition.templateAttribute?.name, category: condition.templateAttribute?.category })}
              content={criteria}
            />
          </Form.Item>
        </Col>
      )
    })) ?? []
  }

  return (
    <>
      <PageHeader
        title={policyData?.name || ''}
        breadcrumb={breadcrumb}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={
              getAdaptivePolicyDetailLink({
                oper: PolicyOperation.EDIT,
                policyId: policyId!,
                templateId: templateId!
              })}
            scopeKey={getScopeKeyByPolicy(PolicyType.ADAPTIVE_POLICY, PolicyOperation.EDIT)}
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.ADAPTIVE_POLICY, PolicyOperation.EDIT)}
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <Space direction={'vertical'}>
        <SummaryCard isLoading={isGetAdaptivePolicyLoading || isGetConditionsLoading}>
          <Form>
            <Row>
              <Col span={6}>
                <Form.Item>
                  <SummaryCard.Item
                    title={$t({ defaultMessage: 'Policy Name' })}
                    content={policyData?.name}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item>
                  <SummaryCard.Item
                    title={$t({ defaultMessage: 'Adaptive Policy Type' })}
                    content='Advanced Policy Engine'
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Paragraph>{$t({ defaultMessage: 'Access Conditions' })}</Paragraph>
              </Col>
              {getConditions(conditionsData?.data)}
            </Row>
            <Row>
              <Col span={6}>
                <Form.Item>
                  <SummaryCard.Item
                    title={$t({ defaultMessage: 'RADIUS Attributes Group' })}
                    content={attributeGroupName}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </SummaryCard>
      </Space>
    </>
  )
}
