import React from 'react'

import { Col, Form, Row, Space, Typography } from 'antd'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { Button, Card, PageHeader, Table, TableProps } from '@acx-ui/components'
import {
  AccessCondition,
  AdaptivePolicy,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { adpativePolicy, assignConditions } from './__test__/fixtures'

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
  const { policyId } = useParams()
  const { Paragraph } = Typography

  // TODO: just for mock data
  const policy = adpativePolicy as AdaptivePolicy
  const conditions = assignConditions
  const venues = [
    {
      id: '1',
      name: 'v1',
      scopes: 5,
      polices: 5
    },
    {
      id: '2',
      name: 'v2',
      scopes: 5,
      polices: 5
    }
  ] as VenueTable []

  const getConditions = function (conditions : AccessCondition []) {
    const rows = []
    if(conditions) {
      for (const condition of conditions) {
        rows.push(
          <Col span={6}>
            <Form.Item
              label={condition.name}>
              <Paragraph>{condition.evaluationRule.regexStringCriteria}</Paragraph>
            </Form.Item>
          </Col>
        )
      }
    }
    return rows
  }

  return (
    <>
      <PageHeader
        title={policy.name || ''}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies & Profiles > Adaptive Policy' }),
            // eslint-disable-next-line max-len
            link: getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST }) }
        ]}
        extra={[
          <TenantLink
            key='edit'
            to={getPolicyDetailsLink({
              type: PolicyType.ADAPTIVE_POLICY,
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
          {/*<Loader states={[{ isLoading, isFetching }]}>*/}
          <Form layout={'vertical'}>
            <Row>
              <Col span={6}>
                <Form.Item label={$t({ defaultMessage: 'Policy Name' })}>
                  <Paragraph>{policy?.name}</Paragraph>
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
                <Paragraph>Access Conditions</Paragraph>
              </Col>
              {getConditions(conditions.content)}
            </Row>
          </Form>
          {/*</Loader>*/}
        </Card>
      </Space>
      <Card title={$t({ defaultMessage: 'Instance ({size})' },
        { size: venues.length })}>
        <div style={{ width: '100%' }}>
          <Table
            rowKey='id'
            columns={useColumns()}
            dataSource={venues}
          />
        </div>
      </Card>
    </>
  )
}
