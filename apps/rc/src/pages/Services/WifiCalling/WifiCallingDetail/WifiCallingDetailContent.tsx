import React from 'react'

import { Row, Typography } from 'antd'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

// import { StackedBarChart }                  from '@acx-ui/components'
import { Card, GridCol, GridRow }        from '@acx-ui/components'
import { useGetWifiCallingServiceQuery } from '@acx-ui/rc/services'
import { QosPriorityEnum }               from '@acx-ui/rc/utils'

import { wifiCallingQosPriorityLabelMapping } from '../../contentsMap'

const WifiCallingDetailContent = () => {
  const params = useParams()
  const { Paragraph } = Typography
  const { $t } = useIntl()

  const { data } = useGetWifiCallingServiceQuery({ params: params })

  if (data) {
    return <Card>
      <GridRow>
        {/*TODO: Temporarily hidden this component until Health api is ready*/}
        {/*<GridCol col={{ span: 4 }}>*/}
        {/*  <Typography.Title level='3'>*/}
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
        {/*</GridCol>*/}
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Description' })}
          </Card.Title>
          <Paragraph>
            <div style={{ overflowWrap: 'anywhere' }}>
              {data.description}
            </div>
          </Paragraph>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Service Name' })}
          </Card.Title>
          <Paragraph>
            <div style={{ overflowWrap: 'anywhere' }}>
              {data.serviceName}
            </div>
          </Paragraph>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Qos Priority' })}
          </Card.Title>
          <Paragraph>{$t(
            wifiCallingQosPriorityLabelMapping[data.qosPriority as QosPriorityEnum])
          }</Paragraph>
        </GridCol>
        <GridCol col={{ span: 10 }}>
          <Card.Title style={{ width: 'maxContent' }}>
            {$t({ defaultMessage: 'Evolved Packet Data Gateway (ePDG)' })}
          </Card.Title>
          <>
            {data.epdgs?.map(epdg => {
              const ipString = epdg.ip ? `(${epdg.ip})` : ''
              return <div key={`${epdg.domain}`}>{epdg.domain} {ipString}</div>
            })}
          </>
        </GridCol>
      </GridRow>
    </Card>
  } else {
    return <Card>
      <Row gutter={24} justify='space-evenly'>
        <div data-testid='target'>Detail Error</div>
      </Row>
    </Card>
  }
}

export default WifiCallingDetailContent
