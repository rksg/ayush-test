import React from 'react'

import { Col, Form, Row, Space, Typography } from 'antd'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { Card, Loader }          from '@acx-ui/components'
import { useGetMacRegListQuery } from '@acx-ui/rc/services'

import { expirationTimeUnits } from '../../MacRegistrationListUtils'

import { NetworkTable } from './NetworkTable'

export function MacRegistrationListOverviewTab () {
  const { $t } = useIntl()
  const { macRegistrationListId } = useParams()
  const macRegistrationListQuery = useGetMacRegListQuery({ params: { macRegistrationListId } })
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
              <Col span={8}>
                <Form.Item
                  label={$t({ defaultMessage: 'Policy Name' })}
                >
                  <Paragraph>{data?.name}</Paragraph>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={$t({ defaultMessage: 'List Expiration' })}
                >
                  <Paragraph>{!data?.expirationEnabled ? 'Never expires' :
                    data.expirationType === 'SPECIFIED_DATE' ?
                      data?.expirationDate : '+' + data.expirationOffset + ' ' +
                    expirationTimeUnits[data.expirationType ?? '']}</Paragraph>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={$t({ defaultMessage: 'Automatically clean expired entries' })}
                >
                  <Paragraph>{data?.autoCleanup ? 'Yes' : 'No'}</Paragraph>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={$t({ defaultMessage: 'Behavior' })}
                >
                  <Paragraph>{'Always redirect to authenticate user'}</Paragraph>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={$t({ defaultMessage: 'Default Access' })}
                >
                  <Paragraph>{'Access'}</Paragraph>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={$t({ defaultMessage: 'Access Policy Set' })}
                >
                  <Paragraph>{''}</Paragraph>
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
