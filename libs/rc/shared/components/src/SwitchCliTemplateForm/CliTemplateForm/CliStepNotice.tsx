import { Form, Input, Col, Row, Space, Typography } from 'antd'
import { FormattedMessage, useIntl }                from 'react-intl'

import { cssStr, StepsForm } from '@acx-ui/components'
import { InformationSolid }  from '@acx-ui/icons'
import { agreeRegExp }       from '@acx-ui/rc/utils'
import { useParams }         from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

import { tooltip } from './'

// TODO: move to rc/components
export function CliStepNotice () {
  const { $t } = useIntl()
  const params = useParams()
  const isTemplate = params?.configType !== 'profiles'
  const editMode = params.action === 'edit'
  // eslint-disable-next-line max-len
  const documentLink = 'https://support.ruckuswireless.com/documents/4026-fastiron-09-0-10-ga-command-reference-guide'

  return <Row gutter={20}>
    <Col span={10}>
      <StepsForm.Title children={$t({ defaultMessage: 'Important Notice' })} />
      <Typography.Text style={{
        fontWeight: 600,
        display: 'block', margin: '4px 0 12px',
        fontSize: cssStr('--acx-body-3-font-size')
      }}>
        {$t({ defaultMessage: 'Read this before you start:' })}
      </Typography.Text>

      {!isTemplate && <Space style={{
        marginBottom: '10px',
        alignItems: 'flex-start', fontSize: '12px' }}
      >
        <InformationSolid />
        <FormattedMessage
          {...tooltip?.noticeInfo}
        />
      </Space>}

      <Space style={{
        color: cssStr('--acx-semantics-red-50'), marginBottom: '10px',
        alignItems: 'flex-start', fontSize: '12px' }}
      >
        <UI.WarningTriangleSolidIcon />
        <FormattedMessage
          {...tooltip?.noticeDesp}
          values={{
            link: <a
              className='link'
              target='_blank'
              href={documentLink}
              rel='noreferrer'>
              {$t({ defaultMessage: 'ICX Fastiron CLI commands' })}
            </a>
          }}
        />
      </Space>

      {/*
      Fix implicit submission issue
      https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission
      */}
      <Form.Item hidden children={<Input />} />

      {!editMode && <Form.Item
        name='agree'
        label={<Space style={{ color: cssStr('--acx-primary-black') }}>{
          $t({ defaultMessage: 'Please type “AGREE” here to continue' })
        }</Space>}
        rules={[
          { required: true, message: $t({ defaultMessage: 'Please type “AGREE”' }) },
          { validator: (_, value) => agreeRegExp(value) }
        ]}
        validateFirst
        children={
          <Input style={{ width: '120px' }} />
        }
        validateTrigger={'onBlur'}
      />}
    </Col>
  </Row>
}
