/* eslint-disable max-len */
import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm, Subtitle }                   from '@acx-ui/components'
import { useNetworkListQuery }                   from '@acx-ui/rc/services'
import { Network, Portal, transformDisplayText } from '@acx-ui/rc/utils'
import { useParams }                             from '@acx-ui/react-router-dom'


const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export function PortalSummaryForm (props: {
  summaryData: Portal | undefined
}) {
  const { $t } = useIntl()
  const { summaryData } = props
  const params = useParams()


  const { data } = useNetworkListQuery({ params:
    { tenantId: params.tenantId, networkId: 'UNKNOWN-NETWORK-ID' }, payload: defaultPayload })

  const networkList = data?.data.reduce<Record<Network['id'], Network>>((map, obj) => {
    map[obj.id] = obj
    return map
  }, {})

  const getNetworks = function () {
    const networks = summaryData?.network
    const rows = []
    if (networks && networks.length > 0) {
      for (const network of networks) {
        const networkId = network.id || ''
        rows.push(
          <li key={networkId} style={{ margin: '10px 0px' }}>
            {networkList && networkList[networkId] ? networkList[networkId].name : networkId}
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
      <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
      <Row >
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Settings' })}
        </Subtitle>
      </Row>
      <Row gutter={20}>
        <Col flex={1}>

          <Form.Item label={$t({ defaultMessage: 'Service Name:' })} children={summaryData?.serviceName} />
        </Col>
        <Col flex={1}>
          <Form.Item
            label={$t({ defaultMessage: 'Tags:' })}
            children={transformDisplayText(summaryData?.tags?.toString())}
          />
        </Col>
        <Col flex={1}>
        </Col>

      </Row>
      <Row>
        <Col>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Wireless Networks ({count})' }, { count: summaryData?.network?.length })}
          </Subtitle>
          <Form.Item children={getNetworks()} />
        </Col>
      </Row>
    </>
  )
}
