import { EnvironmentOutlined }     from '@ant-design/icons'
import { Col, Divider, Form, Row } from 'antd'
import { useIntl }                 from 'react-intl'

import { StepsForm, Subtitle }                       from '@acx-ui/components'
import { useNetworkVenueListQuery }                  from '@acx-ui/rc/services'
import { DHCPSaveData, transformDisplayText, Venue } from '@acx-ui/rc/utils'
import { useParams }                                 from '@acx-ui/react-router-dom'

import { dhcpTypes } from '../contentsMap'
import { PoolTable } from '../DHCPPool/PoolTable'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export function SummaryForm (props: {
  summaryData: DHCPSaveData
}) {
  const { $t } = useIntl()
  const { summaryData } = props
  const params = useParams()


  const { data } = useNetworkVenueListQuery({ params:
    { tenantId: params.tenantId, networkId: 'UNKNOWN-NETWORK-ID' }, payload: defaultPayload })

  const venueList = data?.data.reduce<Record<Venue['id'], Venue>>((map, obj) => {
    map[obj.id] = obj
    return map
  }, {})

  const getVenues = function () {
    const venues:string[] = summaryData.venueIds
    const rows = []
    if (venues && venues.length > 0) {
      for (const venueId of venues) {
        rows.push(
          <li key={venueId} style={{ margin: '10px 0px' }}>
            <EnvironmentOutlined />
            {venueList ? venueList[venueId].name : venueId}
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
      <StepsForm.Title>{ $t({ defaultMessage: 'Summary' }) }</StepsForm.Title>
      <Row gutter={20} style={{ paddingTop: 20 }}>
        <Col flex={1}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'DHCP Settings' }) }
          </Subtitle>
          <Form.Item
            label={$t({ defaultMessage: 'Service Name:' })}
            children={summaryData.serviceName} />
          {/* <Form.Item
            label={$t({ defaultMessage: 'Tags:' })}
            children={summaryData.tags}
          /> */}
          <Form.Item
            label={$t({ defaultMessage: 'DHCP Configuration:' })}
            children={summaryData.dhcpMode && $t(dhcpTypes[summaryData.dhcpMode])}
          />

        </Col>
        <Divider type='vertical' style={{ height: 250 }}/>
        <Col flex={1}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'Activated in venues' }) }
          </Subtitle>
          <Form.Item children={getVenues()} />
        </Col>
      </Row>
      <PoolTable readonly={true} data={summaryData.dhcpPools}/>
    </>
  )
}
