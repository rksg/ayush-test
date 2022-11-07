import React, { useContext, useEffect } from 'react'

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'
import { useParams }            from 'react-router-dom'

import { Card }                from '@acx-ui/components'
import { useRoguePolicyQuery } from '@acx-ui/rc/services'

import { RogueAPDetailContext } from './RogueAPDetectionDetailView'

const RogueAPDetectionDetailContent = () => {
  const { Paragraph } = Typography
  const { $t } = useIntl()

  const { data } = useRoguePolicyQuery({
    params: useParams()
  })

  const { setFiltersId } = useContext(RogueAPDetailContext)

  useEffect(() => {
    if (data){
      const filtersIdList = data.venues ? data.venues.map(venue => venue.id) : ['UNDEFINED']
      setFiltersId(filtersIdList)
    }
  }, [data])

  if (data) {
    return <Card>
      <Row gutter={24} justify='start' style={{ width: '100%' }}>
        <Col span={4}>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'Tags' })}
          </Typography.Title>
          <Paragraph>{[].join(', ')}</Paragraph>
        </Col>

        <Col span={4}>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'Classification Rules' })}
          </Typography.Title>
          <Paragraph>{data.rules.length}</Paragraph>
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

export default RogueAPDetectionDetailContent
