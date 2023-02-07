import { Form, Input, Col, Row, Space, Typography } from 'antd'
import { FormattedMessage, useIntl }                from 'react-intl'

import { cssStr, StepsForm } from '@acx-ui/components'
import { agreeRegExp }       from '@acx-ui/rc/utils'
import { useParams }         from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export function CliStepNotice () {
  const { $t } = useIntl()
  const params = useParams()
  const editMode = params.action === 'edit'

  return <Row gutter={20}>
    <Col span={10}>
      <StepsForm.Title>{$t({ defaultMessage: 'Important Notice' })}</StepsForm.Title>
      <Typography.Text style={{
        fontWeight: 600,
        display: 'block', margin: '4px 0 12px',
        fontSize: cssStr('--acx-body-3-font-size')
      }}>
        {$t({ defaultMessage: 'Read this before you start:' })}
      </Typography.Text>

      <Space style={{
        color: cssStr('--acx-semantics-red-50'), marginBottom: '10px',
        alignItems: 'flex-start', fontSize: '12px' }}
      >
        <UI.WarningTriangleSolidIcon />
        <FormattedMessage
          // eslint-disable-next-line max-len
          defaultMessage={'It is the user\'s responsibility to ensure the validity and ordering of CLI commands are accurate. The recommendation is to get familiarized with {link} to avoid configuration failures'}
          values={{
            link: <a className='link'
              target='_blank'
              // eslint-disable-next-line max-len
              href='https://support.ruckuswireless.com/documents/3450-fastiron-08-0-95-ga-command-reference-guide'
              rel='noreferrer'>
              {$t({ defaultMessage: 'ICX Fastiron CLI commands' })}
            </a>
          }}
        />
      </Space>

      {!editMode && <Form.Item
        name='agree'
        style={{ color: cssStr('--acx-primary-black'), fontSize: '12px' }}  ///
        label={$t({ defaultMessage: 'Please type “AGREE” here to continue:' })}
        rules={[
          { required: true, message: $t({ defaultMessage: 'Please type “AGREE”' }) },
          { validator: (_, value) => agreeRegExp(value) }
        ]}
        validateFirst
        children={
          <Input style={{ width: '120px' }} />
        }
      />}
    </Col>
  </Row>
}
