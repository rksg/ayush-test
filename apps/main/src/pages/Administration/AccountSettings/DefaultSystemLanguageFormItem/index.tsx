import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { MessageMapping } from '../MessageMapping'

const supportedLangs = [{ label: 'English', value: 'en' }]

const DefaultSystemLanguageFormItem = () => {
  const { $t } = useIntl()

  // TODO: wait for UX design on this feature, currently only support "en"
  return (
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          label={$t({ defaultMessage: 'Default System Language' })}
        >
          <Select
            value={supportedLangs[0].value}
            options={supportedLangs}
          />
        </Form.Item>
        <Typography.Paragraph className='description greyText'>
          {
            $t(MessageMapping.default_system_language_description)
          }
        </Typography.Paragraph>
      </Col>
    </Row>)
}

export { DefaultSystemLanguageFormItem }