import { EnvironmentOutlined }                        from '@ant-design/icons'
import { Col, Divider, Form, Input, Row, Typography } from 'antd'

import { StepsForm }                                              from '@acx-ui/components'
import { useCloudpathListQuery }                                  from '@acx-ui/rc/services'
import { NetworkSaveData, NetworkTypeEnum, transformDisplayText } from '@acx-ui/rc/utils'
import { useParams }                                              from '@acx-ui/react-router-dom'

import { transformNetworkType } from '../parser'

import { AaaSummaryForm }  from './AaaSummaryForm'
import { DpskSummaryForm } from './DpskSummaryForm'


export function SummaryForm (props: {
  summaryData: NetworkSaveData
}) {
  const { summaryData } = props
  const selectedId = summaryData.cloudpathServerId
  const { selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        selected: data?.find((item) => item.id === selectedId)
      }
    }
  })  
  const getVenues = function () {
    const venues = summaryData.venues
    const rows = []
    if (venues && venues.length > 0) {
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
      return transformDisplayText()
    }
  }

  return (
    <>
      <StepsForm.Title>Summary</StepsForm.Title>
      <Row gutter={20}>
        <Col flex={1}>
          <Typography.Title level={4}>
            Network Info
          </Typography.Title>
          <Form.Item label='Network Name:' children={summaryData.name} />
          <Form.Item
            label='Info:'
            children={transformDisplayText(summaryData.description)}
          />
          <Form.Item
            label='Type:'
            children={transformNetworkType(summaryData.type)}
          />
          <Form.Item
            label='Use Cloudpath Server:'
            children={summaryData.isCloudpathEnabled ? 'Yes' : 'No'}
          />
          {summaryData.isCloudpathEnabled && selected &&
            <>
              <Form.Item
                label='Cloudpath Server'
                children={ selected.name }
              />
              <Form.Item
                label='Deployment Type'
                children={ selected.deploymentType }
              />
              <Form.Item
                label='Authentication Server'
                children={ `${selected.authRadius.primary.ip}:${selected.authRadius.primary.port}` }
              />
              <Form.Item
                label='Shared Secret'
                children={ <Input.Password
                  readOnly
                  bordered={false}
                  value={selected.authRadius.primary.sharedSecret}
                />}
              />
            </>
          }
          {summaryData.type === NetworkTypeEnum.AAA && !summaryData.isCloudpathEnabled &&
           <AaaSummaryForm summaryData={summaryData} />
          }
          {summaryData.type === NetworkTypeEnum.DPSK && 
            <DpskSummaryForm summaryData={summaryData} />
          }
        </Col>
        <Divider type='vertical' style={{ height: '300px' }}/>
        <Col flex={1}>
          <Typography.Title level={4}>
            Activated in venues
          </Typography.Title>
          <Form.Item children={getVenues()} />
        </Col>
      </Row>
    </>
  )
}

