import { EnvironmentOutlined }     from '@ant-design/icons'
import { Col, Divider, Form, Row } from 'antd'

import { StepsForm }                                from '@acx-ui/components'
import { CreateNetworkFormFields, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { transformNetworkType } from '../parser'
import { FormSubTitle }         from '../styledComponents'

import { AaaSummaryForm }  from './AaaSummaryForm'
import { DpskSummaryForm } from './DpskSummaryForm'


export function SummaryForm (props: {
  summaryData: CreateNetworkFormFields;
}) {
  const defaultValue = '--'
  const { summaryData } = props
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
    <>
      <StepsForm.Title>Summary</StepsForm.Title>
      <Row gutter={20}>
        <Col flex={1}>
          <FormSubTitle>Network Info</FormSubTitle>
          <Form.Item label='Network Name:' children={summaryData.name} />
          <Form.Item
            label='Info:'
            children={summaryData.description || defaultValue}
          />
          <Form.Item
            label='Type:'
            children={transformNetworkType(summaryData.type)}
          />
          <Form.Item
            label='Use Cloudpath Server:'
            children={summaryData.isCloudpathEnabled ? 'Yes' : 'No'}
          />
          {summaryData.type === NetworkTypeEnum.AAA && 
           <AaaSummaryForm summaryData={summaryData} />
          }
          {summaryData.type === NetworkTypeEnum.DPSK && 
            <DpskSummaryForm summaryData={summaryData} />
          }
        </Col>
        <Divider type='vertical' style={{ height: '300px' }}/>
        <Col flex={1}>
          <FormSubTitle>Activated in venues</FormSubTitle>
          <Form.Item children={getVenues()} />
        </Col>
      </Row>
    </>
  )
}

