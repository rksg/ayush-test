import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'
// import styled                                 from 'styled-components/macro'

import { cssStr } from '@acx-ui/components'

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
            style={{ width: '200px' }}
          />
        </Form.Item>
        <Typography.Paragraph style={{ color: cssStr('--acx-neutrals-50') }}>
          {
            $t(MessageMapping.default_system_language_description)
          }
        </Typography.Paragraph>
      </Col>
    </Row>)
}

export { DefaultSystemLanguageFormItem }