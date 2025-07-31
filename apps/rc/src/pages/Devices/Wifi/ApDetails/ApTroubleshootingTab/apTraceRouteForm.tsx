import { useState } from 'react'

import { Row, Col, Form, Input } from 'antd'
import TextArea                  from 'antd/lib/input/TextArea'
import { get }                   from 'lodash'
import { useIntl }               from 'react-intl'

import { Button, Loader, Tooltip }                                                        from '@acx-ui/components'
import { useTraceRouteApMutation }                                                        from '@acx-ui/rc/services'
import { targetHostRegExp, WifiTroubleshootingMessages, useApContext, DiagnosisCommands } from '@acx-ui/rc/utils'

export function ApTraceRouteForm () {
  const { $t } = useIntl()
  const { tenantId, serialNumber, venueId } = useApContext()
  const [form] = Form.useForm()
  const [isValid, setIsValid] = useState(false)
  const [traceRouteAp, { isLoading: isTraceRouteAp }] = useTraceRouteApMutation()
  const handlePingAp = async () => {
    try {
      const payload = {
        targetHost: form.getFieldValue('name'),
        type: DiagnosisCommands.TRACE_ROUTE
      }
      const traceRouteApResult =
        await traceRouteAp({
          params: { tenantId, serialNumber, venueId },
          payload,
          enableRbac: true
        }).unwrap()
      if (traceRouteApResult) {
        form.setFieldValue('traceRoute', get(traceRouteApResult, 'response.response'))
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
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
            type='primary'
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

