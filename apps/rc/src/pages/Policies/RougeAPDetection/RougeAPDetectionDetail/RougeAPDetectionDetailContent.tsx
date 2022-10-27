import React from 'react'

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'
import { useParams }            from 'react-router-dom'

import { Card }                       from '@acx-ui/components'
import { useGetRougePolicyListQuery } from '@acx-ui/rc/services'

const RougeAPDetectionDetailContent = () => {
  const params = useParams()
  console.log(params)
  const { Paragraph } = Typography
  const { $t } = useIntl()

  const { data } = useGetRougePolicyListQuery({
    params: params,
    payload: {
      page: 1,
      pageSize: 10000,
      url: '/api/viewmodel/tenant/{tenantId}/rogue/policy'
    }
  })

  if (data) {
    console.log(data.data)
    const policyData = data.data.filter(d => d.id === params.policyId)[0]
    console.log(policyData)
    return <Card>
      <Row gutter={24} justify='start' style={{ width: '100%' }}>
        <Col span={4}>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'Tags' })}
          </Typography.Title>
          <Paragraph>{['a', 'b', 'c'].join(', ')}</Paragraph>
        </Col>

        <Col span={4}>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'Classification Rules' })}
          </Typography.Title>
          <Paragraph>{policyData.numOfRules}</Paragraph>
        </Col>
      </Row>
    </Card>
  } else {
    return <Card>
      <Row gutter={24} justify='space-evenly' style={{ width: '100%' }}>
        <div data-testid='target'>{$t({ defaultMessage: 'Detail content Error' })}</div>
      </Row>
    </Card>
  }
}

export default RougeAPDetectionDetailContent
