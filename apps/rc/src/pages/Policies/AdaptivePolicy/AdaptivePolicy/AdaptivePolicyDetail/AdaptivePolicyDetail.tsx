import React from 'react'

import { Col, Form, Row, Space, Typography } from 'antd'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { Button, Card, Loader, PageHeader }                         from '@acx-ui/components'
import { useGetAdaptivePolicyQuery, useGetConditionsInPolicyQuery } from '@acx-ui/rc/services'
import {
  AccessCondition,
  CriteriaOption,
  getAdaptivePolicyDetailLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

export default function AdaptivePolicyDetail () {
  const { $t } = useIntl()
  const { policyId, templateId } = useParams()
  const { Paragraph } = Typography

  // eslint-disable-next-line max-len
  const { data: policyData, isLoading: isGetAdaptivePolicyLoading }= useGetAdaptivePolicyQuery({ params: { templateId, policyId } })

  // eslint-disable-next-line max-len
  const { data: conditionsData, isLoading: isGetConditionsLoading } = useGetConditionsInPolicyQuery({
    payload: { page: '1', pageSize: '2147483647' },
    params: { policyId, templateId } })

  const getConditions = function (conditions : AccessCondition [] | undefined) {
    return conditions?.map(((condition) => {
      // eslint-disable-next-line max-len
      const criteria = condition.evaluationRule.criteriaType === CriteriaOption.DATE_RANGE ?
        // eslint-disable-next-line max-len
        `${condition.evaluationRule?.when} ${condition.evaluationRule?.startTime} - ${condition.evaluationRule?.endTime}`
        : condition.evaluationRule.regexStringCriteria
      return (
        <Col span={6} key={condition.id}>
          <Form.Item
            label={condition.templateAttribute?.name ?? ''}>
            <Paragraph>{criteria}</Paragraph>
          </Form.Item>
        </Col>
      )
    })) ?? []
  }

  return (
    <>
      <PageHeader
        title={policyData?.name || ''}
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) },
          { text: $t({ defaultMessage: 'Adaptive Policy' }),
            // eslint-disable-next-line max-len
            link: getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST }) }
        ]}
        extra={filterByAccess([
          <TenantLink
            to={
              getAdaptivePolicyDetailLink({
                oper: PolicyOperation.EDIT,
                policyId: policyId!,
                templateId: templateId!
              })
            }>
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <Space direction={'vertical'}>
        <Card>
          <Loader states={[
            { isLoading: isGetAdaptivePolicyLoading || isGetConditionsLoading }
          ]}>
            <Form layout={'vertical'}>
              <Row>
                <Col span={6}>
                  <Form.Item label={$t({ defaultMessage: 'Policy Name' })}>
                    <Paragraph>{policyData?.name}</Paragraph>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={$t({ defaultMessage: 'Access Policy Type' })}>
                    <Paragraph>Advanced Policy Engine</Paragraph>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Paragraph>{$t({ defaultMessage: 'Access Conditions' })}</Paragraph>
                </Col>
                {getConditions(conditionsData?.data)}
              </Row>
            </Form>
          </Loader>
        </Card>
      </Space>
    </>
  )
}
