import React from 'react'

import { Col, Form, Row, Space, Typography } from 'antd'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { Button, Card, Loader, PageHeader, Table, TableProps }      from '@acx-ui/components'
import { useGetAdaptivePolicyQuery, useGetConditionsInPolicyQuery } from '@acx-ui/rc/services'
import {
  AccessCondition, getAdaptivePolicyDetailLink, getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

export interface VenueTable {
  id: string,
  name: string,
  polices: number,
  scopes: number
}

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<VenueTable>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'name',
      defaultSortOrder: 'ascend'
      // render: function (data, row) {
      // if (disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1) {
      //   return data
      // } else {
      //   return (
      //     <TenantLink
      //       to={`/networks/wireless/${row.id}/network-details/overview`}>{data}</TenantLink>
      //   )
      // }
      // }
    },
    {
      title: $t({ defaultMessage: 'Contained Policies' }),
      key: 'polices',
      dataIndex: 'polices'
    },
    {
      key: 'scopes',
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'scopes'
    }
  ]

  return columns
}

export function AdaptivePolicyDetail () {
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
    return conditions?.map(((condition) =>{
      return (
        <Col span={6} key={condition.id}>
          <Form.Item
            label={condition.name ?? 'Need service support'}>
            <Paragraph>{condition.evaluationRule.regexStringCriteria}</Paragraph>
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
        extra={[
          <TenantLink
            key='edit'
            to={
              getAdaptivePolicyDetailLink({
                oper: PolicyOperation.EDIT,
                policyId: policyId!,
                templateId: templateId!
              })
            }
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
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
        <Card title={$t({ defaultMessage: 'Instance ({size})' }, // TODO: need to update after integrate with network
          { size: 0 })}>
          <div style={{ width: '100%' }}>
            <Table
              rowKey='id'
              columns={useColumns()}
              dataSource={[] as VenueTable []}
            />
          </div>
        </Card>
      </Space>
    </>
  )
}
