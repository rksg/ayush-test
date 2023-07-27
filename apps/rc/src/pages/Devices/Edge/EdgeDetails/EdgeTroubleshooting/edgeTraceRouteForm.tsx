import { useState } from 'react'

import { Row, Col, Form, Input } from 'antd'
import TextArea                  from 'antd/lib/input/TextArea'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { Button, Loader, Tooltip }                       from '@acx-ui/components'
import { useTraceRouteEdgeMutation }                     from '@acx-ui/rc/services'
import { targetHostRegExp, EdgeTroubleshootingMessages } from '@acx-ui/rc/utils'

export function EdgeTraceRouteForm () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const [form] = Form.useForm()
  const [isValid, setIsValid] = useState(false)
  const [traceRouteEdge, { isLoading: isTraceRouteEdge }] = useTraceRouteEdgeMutation()
  const handleTraceRouteEdge = async () => {
    try {
      const payload = {
        targetHost: form.getFieldValue('name'),
        action: 'traceRoute'
      }
      const traceRouteEdgeResult =
        await traceRouteEdge({ params: { tenantId, serialNumber }, payload }).unwrap()
      if (traceRouteEdgeResult) {
        form.setFieldValue('traceRoute', _.get(traceRouteEdgeResult, 'response.response'))
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
              title={$t(EdgeTroubleshootingMessages.Target_Host_IP_TOOLTIP)}
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
            disabled={!isValid || isTraceRouteEdge}
            onClick={handleTraceRouteEdge}>
            {$t({ defaultMessage: 'Run' })}
          </Button>
        </Form.Item>
      </Col>
    </Row>

    <Loader states={[{
      isLoading: false,
      isFetching: isTraceRouteEdge
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

