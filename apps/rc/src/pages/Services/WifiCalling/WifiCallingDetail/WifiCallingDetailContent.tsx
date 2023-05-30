import React from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'
import { useParams }  from 'react-router-dom'

import { Card, GridCol, GridRow, Loader } from '@acx-ui/components'
import { useGetWifiCallingServiceQuery }  from '@acx-ui/rc/services'
import { QosPriorityEnum }                from '@acx-ui/rc/utils'

import { wifiCallingQosPriorityLabelMapping } from '../../contentsMap'

const WifiCallingDetailContent = () => {
  const params = useParams()
  const { Paragraph } = Typography
  const { $t } = useIntl()

  const { data, isLoading } = useGetWifiCallingServiceQuery({ params: params })

  return <Loader states={[{ isLoading }]}>
    <Card>
      {data && <GridRow>
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
      </GridRow>}
    </Card>
  </Loader>
}

export default WifiCallingDetailContent
