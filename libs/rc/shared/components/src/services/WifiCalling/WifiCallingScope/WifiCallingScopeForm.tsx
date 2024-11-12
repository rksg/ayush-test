import { Form, Col, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import WifiCallingNetworkTable from './WifiCallingNetworkTable'

const WifiCallingScopeForm = (props: { edit?: boolean }) => {
  const { $t } = useIntl()
  const { edit } = props

  return (
    <Row gutter={20}>
      <Col span={15}>
        <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>

        <Form.Item
          name='dataGateway'
          label={$t({ defaultMessage:
              'Select the wireless networks where the Wi-Fi Calling Service will be applied:' })}
        >
          <WifiCallingNetworkTable edit={edit} />
        </Form.Item>

      </Col>

      <Col span={5}>
      </Col>
    </Row>
  )
}

export default WifiCallingScopeForm
