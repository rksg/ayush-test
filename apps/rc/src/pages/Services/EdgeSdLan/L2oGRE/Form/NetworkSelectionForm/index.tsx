import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm }              from '@acx-ui/components'
import { EdgeMvSdLanFormNetwork } from '@acx-ui/rc/utils'

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
          rules={[
            {
              validator: (_, value) => {
                return value && Object.keys((value as EdgeMvSdLanFormNetwork)).length > 0
                  ? Promise.resolve()
                  // eslint-disable-next-line max-len
                  : Promise.reject($t({ defaultMessage: 'Please select at least 1 <venueSingular></venueSingular> network' }))
              }
            }
          ]}
        >
          <EdgeSdLanVenueNetworksTable />
        </Form.Item>
      </Col>
    </Row>
  </>
}