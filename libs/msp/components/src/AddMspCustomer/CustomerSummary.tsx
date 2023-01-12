import {  Col,  Form,  Row,  Typography } from 'antd'
import { useIntl }                        from 'react-intl'

import { Subtitle } from '@acx-ui/components'

export const CustomerSummary = () => {
  const intl = useIntl()
  const { Paragraph } = Typography
  return (
    <Row gutter={20}>
      <Col span={18}>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Summary' })}</Subtitle>
        <Form.Item
          label={intl.$t({ defaultMessage: 'Customer Name' })}
        >
          <Paragraph>{'my test ec 168'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Address' })}
        >
          <Paragraph>{'350 W Java Dr, Sunnyvale, CA 94089, USA'}</Paragraph>
        </Form.Item>

        <Form.Item
          label={intl.$t({ defaultMessage: 'MSP Administrators' })}
        >
          <Paragraph>{'demo.msp@email.com'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Integrator' })}
        >
          <Paragraph>{'demo.msp@email.com'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Installer' })}
        >
          <Paragraph>{'demo.msp@email.com'}</Paragraph>
        </Form.Item>

        <Form.Item
          label={intl.$t({ defaultMessage: 'Customer Administrator Name' })}
        >
          <Paragraph>{'Eric Leu'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Email' })}
        >
          <Paragraph>{'eleu1658@yahoo.com'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Role' })}
        >
          <Paragraph>{'Prime Administrator'}</Paragraph>
        </Form.Item>

        <Form.Item
          label={intl.$t({ defaultMessage: 'Wi-Fi Subscriptions' })}
        >
          <Paragraph>{'40'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Switch Subscriptions' })}
        >
          <Paragraph>{'25'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Service Expiration Date' })}
        >
          <Paragraph>{'12/22/2023'}</Paragraph>
        </Form.Item>
      </Col>
    </Row>
  )
}
