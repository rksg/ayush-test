import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { EdgeSdLanVenueNetworksTemplateTable } from './VenueNetworkTable'

export const NetworkTemplateSelectionForm = () => {
  const { $t } = useIntl()

  return <>
    <Row>
      <Col span={24}>
        <StepsForm.Title>
          {$t({ defaultMessage: 'Wi-Fi Network Template Selection' })}
        </StepsForm.Title>
      </Col>
    </Row>
    <Row >
      <Col span={24}>
        <Form.Item name='activatedNetworkTemplates'>
          <EdgeSdLanVenueNetworksTemplateTable />
        </Form.Item>
      </Col>
    </Row>
  </>
}