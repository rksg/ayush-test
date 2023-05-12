import { Form, Col, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsFormLegacy } from '@acx-ui/components'

import SyslogVenueTable from './SyslogVenueTable'

const SyslogScopeForm = () => {
  const { $t } = useIntl()

  return (
    <Row gutter={20}>
      <Col span={15}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Scope' })}</StepsFormLegacy.Title>

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
