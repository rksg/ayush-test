import React from 'react'

import { Col, Form, Row, Space, Typography } from 'antd'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { Card, Loader }          from '@acx-ui/components'
import { useGetMacRegListQuery } from '@acx-ui/rc/services'

import { returnExpirationString } from '../../MacRegistrationListUtils'

import { NetworkTable } from './NetworkTable'

export function MacRegistrationListOverviewTab () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const macRegistrationListQuery = useGetMacRegListQuery({ params: { policyId } })
  const data = macRegistrationListQuery.data
  const { Paragraph } = Typography

  return (
    <Space direction={'vertical'}>
      <Card>
        <Loader states={[
          macRegistrationListQuery,
          { isLoading: false }
        ]}>
          <Form layout={'vertical'}>
            <Row>
              <Col span={6}>
                <Form.Item
                  label={$t({ defaultMessage: 'Name' })}
                >
                  <Paragraph>{data?.name}</Paragraph>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={$t({ defaultMessage: 'List Expiration' })}
                >
                  <Paragraph>{returnExpirationString(data ?? {}) ?? ''}</Paragraph>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={$t({ defaultMessage: 'Automatically clean expired entries' })}
                >
                  <Paragraph>{data?.autoCleanup ? $t({ defaultMessage: 'Yes' }) :
                    $t({ defaultMessage: 'No' })}</Paragraph>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={$t({ defaultMessage: 'Behavior' })}
                >
                  {/* eslint-disable-next-line max-len */}
                  <Paragraph>{$t({ defaultMessage: 'Always redirect to authenticate user' })}</Paragraph>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={$t({ defaultMessage: 'Default Access' })}
                >
                  <Paragraph>{data?.defaultAccess ?? ''}</Paragraph>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={$t({ defaultMessage: 'Access Policy Set' })}
                >
                  <Paragraph>{data?.policyId ?? ''}</Paragraph>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Loader>
      </Card>
      <NetworkTable/>
    </Space>
  )
}
