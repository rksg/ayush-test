import React from 'react'

import { Col, Form, Row, Space, Typography } from 'antd'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { Button, Card, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { useGetAdaptivePolicySetQuery }                        from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

export interface NetworkTable {
  id: string,
  name: string,
  type: string,
  venues: number
}

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<NetworkTable>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'type',
      dataIndex: 'type'
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues'
    }
  ]

  return columns
}

export function AdaptivePolicySetDetail () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { Paragraph } = Typography

  // eslint-disable-next-line max-len
  const { data: policySetData, isLoading: isGetAdaptivePolicySetLoading }= useGetAdaptivePolicySetQuery({ params: { policySetId: policyId } })

  // TODO: just for mock data
  const networks = [
    {
      id: '1',
      name: 'v1',
      type: 'PSK',
      venues: 5
    },
    {
      id: '2',
      name: 'v2',
      type: 'PSK',
      venues: 5
    }
  ] as NetworkTable []

  return (
    <>
      <PageHeader
        title={policySetData?.name || ''}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies & Profiles > Adaptive Set Policy' }),
            link: getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET,
              oper: PolicyOperation.LIST }) }
        ]}
        extra={[
          <TenantLink
            key='edit'
            to={
              getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET,
                oper: PolicyOperation.EDIT })
            }
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
      />
      <Space direction={'vertical'}>
        <Card>
          <Loader states={[
            { isLoading: isGetAdaptivePolicySetLoading }
          ]}>
            <Form layout={'vertical'}>
              <Row>
                <Col span={6}>
                  <Form.Item label={$t({ defaultMessage: 'Policy Name' })}>
                    <Paragraph>{policySetData?.name}</Paragraph>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={$t({ defaultMessage: 'Members' })}>
                    <Paragraph>0</Paragraph>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Loader>
        </Card>
      </Space>
      <Card title={$t({ defaultMessage: 'Instance ({size})' },
        { size: networks.length })}>
        <div style={{ width: '100%' }}>
          <Table
            rowKey='id'
            columns={useColumns()}
            dataSource={networks}
          />
        </div>
      </Card>
    </>
  )
}
