import { EnvironmentOutlined } from '@ant-design/icons'
import { Col, Form, Row }      from 'antd'

import { StepsForm }               from '@acx-ui/components'
import { CreateNetworkFormFields } from '@acx-ui/rc/utils'

import { NetworkDiagram }       from '../NetworkDiagram/NetworkDiagram'
import { transformNetworkType } from '../parser'

import { CloudpathSummary } from './CloudpathSummary'


export function OpenSummaryForm (props: {
  summaryData: CreateNetworkFormFields;
}) {
  const { summaryData } = props
  const defaultValue = '--'


  const getVenues = function () {
    const venues = summaryData.venues
    const rows = []
    if (summaryData.venues.length > 0) {
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
        <Form.Item label='Network Name' children={summaryData.name} />
        <Form.Item
          label='Description'
          children={summaryData.description || defaultValue}
        />
        <Form.Item
          label='Network Type'
          children={transformNetworkType(summaryData.type)}
        />
        <Form.Item
          label='Use Cloudpath Server'
          children={summaryData.isCloudpathEnabled ? 'Yes' : 'No'}
        />
        {summaryData.isCloudpathEnabled &&
          <CloudpathSummary cloudpathServerId={summaryData.cloudpathServerId}></CloudpathSummary>
        }
        <Form.Item label='Activated in venues' children={getVenues()} />
      </Col>
      <Col span={14}>
        <NetworkDiagram type={summaryData.type} />
      </Col>
    </Row>
  )
}

