import { useState } from 'react'

import { Row, Col, Form, Input } from 'antd'
import TextArea                  from 'antd/lib/input/TextArea'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Button, Loader, showToast, Tooltip }            from '@acx-ui/components'
import { useTraceRouteApMutation }                       from '@acx-ui/rc/services'
import { targetHostRegExp, WifiTroubleshootingMessages } from '@acx-ui/rc/utils'

import { useApContext } from '../ApContext'

export function ApTraceRouteForm () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useApContext()
  const [form] = Form.useForm()
  const [isValid, setIsValid] = useState(false)
  const [traceRouteAp, { isLoading: isTraceRouteAp }] = useTraceRouteApMutation()
  const handlePingAp = async () => {
    try {
      const payload = {
        targetHost: form.getFieldValue('name'),
        action: 'traceRoute'
      }
      const traceRouteApResult =
        await traceRouteAp({ params: { tenantId, serialNumber }, payload }).unwrap()
      if (traceRouteApResult) {
        form.setFieldValue('traceRoute', _.get(traceRouteApResult, 'response.response'))
      }
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const onChangeForm = function () {
    form.validateFields()
      .then(() => {
        setIsValid(true)
      })
      .catch(() => {
        setIsValid(false)
      })
  }

  return <Form
    form={form}
    layout='vertical'
    onChange={onChangeForm}>
    <Row gutter={20}>
      <Col span={8}>
        <Form.Item
          name='name'
          label={<>
            {$t({ defaultMessage: 'Target host or IP address' })}
            <Tooltip.Question
              title={$t(WifiTroubleshootingMessages.Target_Host_IP_TOOLTIP)}
              placement='bottom' />
          </>}
          rules={[
            { required: true },
            { validator: (_, value) => targetHostRegExp(value) }
          ]}
          validateFirst
          // hasFeedback
          children={<Input />}
        />
        <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
          <Button
            type='secondary'
            htmlType='submit'
            disabled={!isValid || isTraceRouteAp}
            onClick={handlePingAp}>
            {$t({ defaultMessage: 'Run' })}
          </Button>
        </Form.Item>
      </Col>
    </Row>

    <Loader states={[{
      isLoading: false,
      isFetching: isTraceRouteAp
    }]}>
      <Form.Item
        name='traceRoute'>

        <TextArea
          style={{ resize: 'none', height: '300px' }}
          autoSize={false}
          readOnly={true}
        />

      </Form.Item>
    </Loader>
  </Form>
}

