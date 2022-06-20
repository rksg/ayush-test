import { EnvironmentOutlined } from '@ant-design/icons'
import { Col, Form, Row }      from 'antd'

import { StepsForm }                                from '@acx-ui/components'
import { NetworkTypeEnum, CreateNetworkFormFields } from '@acx-ui/rc/utils'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'

export function NetworkSummaryForm (props: {
  summaryData: CreateNetworkFormFields;
}) {
  const defaultValue = '--'

  const getVenues = function () {
    const venues = props.summaryData.venues
    const rows = []
    if (props.summaryData.venues.length > 0) {
      for (const venue of venues) {
        rows.push(
          <li key={(venue as any).venueId} style={{ margin: '10px 0px' }}>
            <EnvironmentOutlined />
            {(venue as any).name}
          </li>
        )
      }
      return rows
    } else {
      return defaultValue
    }
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>Summary</StepsForm.Title>
        <Form.Item label='Network Name' children={props.summaryData.name} />
        <Form.Item
          label='Description'
          children={props.summaryData.description || defaultValue}
        />
        <Form.Item
          label='Network Type'
          children={transformNetworkType(props.summaryData.type)}
        />
        <Form.Item
          label='Use Cloudpath Server'
          children={props.summaryData.isCloudpathEnabled ? 'Yes' : 'No'}
        />
        <Form.Item label='Activated in venues' children={getVenues()} />
      </Col>
      <Col span={14}>
        <NetworkDiagram />
      </Col>
    </Row>
  )
}

const transformNetworkType = (value: any) => {
  let displayValue = ''
  switch (value) {
    case NetworkTypeEnum.OPEN:
      displayValue = 'Open Network'
      break
    case NetworkTypeEnum.PSK:
      displayValue = 'Pre-Shared Key (PSK)'
      break
    case NetworkTypeEnum.DPSK:
      displayValue = 'Dynamic Pre-Shared Key (DPSK)'
      break
    case NetworkTypeEnum.AAA:
      displayValue = 'Enterprise AAA (802.1X)'
      break
    case NetworkTypeEnum.CAPTIVEPORTAL:
      //TODO
      break
  }
  return displayValue
}
