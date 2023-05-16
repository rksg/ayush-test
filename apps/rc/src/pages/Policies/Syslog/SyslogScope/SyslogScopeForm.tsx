import { Form, Col, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import SyslogVenueTable from './SyslogVenueTable'

const SyslogScopeForm = () => {
  const { $t } = useIntl()

  return (
    <Row gutter={20}>
      <Col span={15}>
        <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>

        <Form.Item
          name='venueTable'
          label={$t({ defaultMessage:
              'Select the venues where the syslog server will be applied:' })}
        >
          <SyslogVenueTable />
        </Form.Item>

      </Col>

      <Col span={5}>
      </Col>
    </Row>
  )
}

export default SyslogScopeForm
