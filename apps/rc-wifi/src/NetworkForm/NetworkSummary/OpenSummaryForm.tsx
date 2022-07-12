import { EnvironmentOutlined }   from '@ant-design/icons'
import { Col, Form, Row, Input } from 'antd'

import { StepsForm }                                from '@acx-ui/components'
import { useCloudpathListQuery, useVenueListQuery } from '@acx-ui/rc/services'
import { CreateNetworkFormFields }                  from '@acx-ui/rc/utils'
import { useParams }                                from '@acx-ui/react-router-dom'

import { NetworkDiagram }       from '../NetworkDiagram/NetworkDiagram'
import { transformNetworkType } from '../parser'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export function OpenSummaryForm (props: {
  summaryData: CreateNetworkFormFields;
}) {
  const { summaryData } = props
  const defaultValue = '--'

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
    if (summaryData.venues.length > 0) {
      for (const venue of venues) {
        rows.push(
          <li key={(venue as any).venueId} style={{ margin: '10px 0px' }}>
            <EnvironmentOutlined />
            {venueList[(venue as any).venueId].name}
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
        <Form.Item label='Activated in venues' children={getVenues()} />
      </Col>
      <Col span={14}>
        <NetworkDiagram type={summaryData.type} />
      </Col>
    </Row>
  )
}

