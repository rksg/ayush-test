import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { EdgeSdLanVenueNetworksTable } from './VenueNetworkTable'

export const NetworkSelectionForm = () => {
  const { $t } = useIntl()

  return <>
    <Row>
      <Col span={24}>
        <StepsForm.Title>{$t({ defaultMessage: 'Wi-Fi Network Selection' })}</StepsForm.Title>
      </Col>
    </Row>
    <Row >
      <Col span={24}>
        <Form.Item
          name='activatedNetworks'
        >
          <EdgeSdLanVenueNetworksTable />
        </Form.Item>
      </Col>
    </Row>
  </>
}