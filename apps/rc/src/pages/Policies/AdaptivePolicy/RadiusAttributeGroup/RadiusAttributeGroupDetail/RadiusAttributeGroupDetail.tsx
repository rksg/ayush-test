import React from 'react'

import { Col, Form, Row, Space, Typography } from 'antd'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { Button, Card, Loader, PageHeader } from '@acx-ui/components'
import { useGetRadiusAttributeGroupQuery }  from '@acx-ui/rc/services'
import {
  AttributeAssignment,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'


export default function RadiusAttributeGroupDetail () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { data, isFetching, isLoading } = useGetRadiusAttributeGroupQuery({ params: { policyId } })
  const { Paragraph } = Typography

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

  return (
    <>
      <PageHeader
        title={data?.name || ''}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies & Profiles > RADIUS Attribute Groups' }),
            // eslint-disable-next-line max-len
            link: getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST }) }
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
                  <Form.Item label={$t({ defaultMessage: 'Policy Name' })}>
                    <Paragraph>{data?.name}</Paragraph>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={$t({ defaultMessage: 'Members' })}
                  >
                    <Paragraph>0</Paragraph>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Paragraph>RADIUS Attributes</Paragraph>
                </Col>
                {getAttributes(data?.attributeAssignments)}
              </Row>
            </Form>
          </Loader>
        </Card>
      </Space>
    </>
  )
}
