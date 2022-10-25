import React from 'react'

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'
import { useParams }            from 'react-router-dom'

// import { StackedBarChart }                  from '@acx-ui/components'
import { Card }                          from '@acx-ui/components'
import { useGetWifiCallingServiceQuery } from '@acx-ui/rc/services'

const WifiCallingDetailContent = (props: { tenantId: string }) => {
  const params = useParams()
  const { Paragraph } = Typography
  const { $t } = useIntl()

  const { data } = useGetWifiCallingServiceQuery({
    params: { ...params, tenantId: props.tenantId }
  })

  if (data) {
    return <Card>
      <Row gutter={24} justify='space-between' style={{ width: '100%' }}>
        {/*TODO: Temporarily hidden this component until Health api is ready*/}
        {/*<Col span={4}>*/}
        {/*  <Typography.Title level={TYPOGRAPHY_LEVEL}>*/}
        {/*    {$t({ defaultMessage: 'Service Health' })}*/}
        {/*  </Typography.Title>*/}
        {/*  <StackedBarChart*/}
        {/*    style={{ height: 20, width: 100 }}*/}
        {/*    data={[{*/}
        {/*      category: 'emptyStatus',*/}
        {/*      series: data.serviceHealth*/}
        {/*    }]}*/}
        {/*    showTooltip={false}*/}
        {/*    showLabels={false}*/}
        {/*    showTotal={false}*/}
        {/*    barColors={['#63a103', '#e1e600', '#910012']}*/}
        {/*  />*/}
        {/*</Col>*/}

        <Col span={4}>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'Description' })}
          </Typography.Title>
          <Paragraph>{data.description}</Paragraph>
        </Col>

        <Col span={4}>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'Service Name' })}
          </Typography.Title>
          <Paragraph>{data.serviceName}</Paragraph>
        </Col>

        <Col span={4}>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'Qos Priority' })}
          </Typography.Title>
          <Paragraph>{data.qosPriority}</Paragraph>
        </Col>

        <Col span={4}>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'Evolved Packet Data Gateway (ePDG)' })}
          </Typography.Title>
          <>
            {data.epdgs?.map(epdg => {
              return <div key={`${epdg.domain}`}>{epdg.domain} ({epdg.ip})</div>
            })}
          </>
        </Col>
      </Row>
    </Card>
  } else {
    return <Card>
      <Row gutter={24} justify='space-evenly' style={{ width: '100%' }}>
        <div data-testid='target'>Detail Error</div>
      </Row>
    </Card>
  }
}

export default WifiCallingDetailContent
