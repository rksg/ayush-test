import React, { useState } from 'react'

import { Col, Row, Typography, Radio, RadioChangeEvent } from 'antd'
import { useIntl }                                       from 'react-intl'
import { useParams }                                     from 'react-router-dom'

// import { StackedBarChart }                  from '@acx-ui/components'
import { Card }       from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import { DivContainer } from './styledComponents'

type TabPosition = 'pools' | 'lease'


const WifiCallingDetailContent = () => {
  const params = useParams()
  const { Title, Text, Paragraph } = Typography
  const { $t } = useIntl()
  const TYPOGRAPHY_LEVEL = 4
  const SPAN_NUM = 3

  const [tabPosition, setTabPosition] = useState<TabPosition>('pools')

  const changeTabPosition = (e: RadioChangeEvent) => {
    setTabPosition(e.target.value)
  }

  return <>
    <Card>
      <Row gutter={24} justify='space-between' style={{ width: '100%' }}>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Service Name' })}</Text>
          </Title>
          <TenantLink
            to={''}>{'test'}</TenantLink>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Service Status' })}</Text>
          </Title>
          <Paragraph>{'test'}</Paragraph>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'DHCP  Configuration' })}</Text>
          </Title>
          <Paragraph>{'test'}</Paragraph>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'DHCP Pools' })}</Text>
          </Title>
          <Paragraph>{'test'}</Paragraph>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Primary DHCP Server' })}</Text>
          </Title>
          <Paragraph>{'test'}</Paragraph>
        </Col>
        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Secondary DHCP Server' })}</Text>
          </Title>
          <Paragraph>{'test'}</Paragraph>
        </Col>
        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Switches' })}</Text>
          </Title>
          <Paragraph>{'test'}</Paragraph>
        </Col>
        <Col span={SPAN_NUM}>
          <div>
            <TenantLink
              to={''}>{'Manage Local Service'}</TenantLink>
          </div>
        </Col>
      </Row>
    </Card>
    <DivContainer>
      <Radio.Group value={tabPosition} onChange={changeTabPosition}>
        <Radio.Button value='pools'>Pools (6)</Radio.Button>
        <Radio.Button value='lease'>Lease Table (34 Online)</Radio.Button>
      </Radio.Group>
    </DivContainer>
  </>
}

export default WifiCallingDetailContent
