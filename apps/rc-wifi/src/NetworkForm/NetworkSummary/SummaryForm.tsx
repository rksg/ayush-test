import { EnvironmentOutlined }            from '@ant-design/icons'
import { Col, Divider, Form, Input, Row } from 'antd'

import { StepsForm, Subtitle }                                    from '@acx-ui/components'
import { useCloudpathListQuery, useVenueListQuery }               from '@acx-ui/rc/services'
import { NetworkSaveData, NetworkTypeEnum, transformDisplayText } from '@acx-ui/rc/utils'
import { useParams }                                              from '@acx-ui/react-router-dom'

import { transformNetworkType } from '../parser'

import { AaaSummaryForm }  from './AaaSummaryForm'
import { DpskSummaryForm } from './DpskSummaryForm'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export function SummaryForm (props: {
  summaryData: NetworkSaveData
}) {
  const { summaryData } = props
  const selectedId = summaryData.cloudpathServerId
  const params = useParams()
  const { selected } = useCloudpathListQuery({ params }, {
    selectFromResult ({ data }) {
      return {
        selected: data?.find((item) => item.id === selectedId)
      }
    }
  })  

  const { data } = useVenueListQuery({ params:
    { tenantId: params.tenantId, networkId: 'UNKNOWN-NETWORK-ID' }, payload: defaultPayload })

  const venueList = data?.data.reduce((map: any, obj: any) => {
    map[obj.id] = obj
    return map
  }, {})

  const getVenues = function () {
    const venues = summaryData.venues
    const rows = []
    if (venues && venues.length > 0) {
      for (const venue of venues) {
        rows.push(
          <li key={(venue as any).venueId} style={{ margin: '10px 0px' }}>
            <EnvironmentOutlined />
            {venueList ? venueList[(venue as any).venueId].name: (venue as any).venueId}
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
          <Subtitle level={4}>
            Network Info
          </Subtitle>
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
                children={selected.name}
              />
              <Form.Item
                label='Deployment Type'
                children={selected.deploymentType}
              />
              <Form.Item
                label='Authentication Server'
                children={`${selected.authRadius.primary.ip}:${selected.authRadius.primary.port}`}
              />
              <Form.Item
                label='Shared Secret'
                children={<Input.Password
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
          <Subtitle level={4}>
            Activated in venues
          </Subtitle>
          <Form.Item children={getVenues()} />
        </Col>
      </Row>
    </>
  )
}