import { useState } from 'react'

import { Row, Col, Form, Input } from 'antd'
import TextArea                  from 'antd/lib/input/TextArea'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { Button, Loader, Tooltip }                                                from '@acx-ui/components'
import { usePingEdgeMutation }                                                    from '@acx-ui/rc/services'
import { targetHostRegExp, EdgeTroubleshootingMessages, EdgeTroubleshootingType } from '@acx-ui/rc/utils'


export function EdgePingForm () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const [pingForm] = Form.useForm()
  const [isValid, setIsValid] = useState(false)
  const [pingEdge, { isLoading: isPingingEdge }] = usePingEdgeMutation()
  const handlePingEdge = async () => {
    try {
      const payload = {
        targetHost: pingForm.getFieldValue('name'),
        action: EdgeTroubleshootingType.PING
      }
      const pingEdgeResult = await pingEdge(
        { params: { tenantId, serialNumber }, payload }).unwrap()
      if (pingEdgeResult) {

        pingForm.setFieldValue('result', _.get(pingEdgeResult, 'response'))
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onChangeForm = function () {
    pingForm.validateFields()
      .then(() => {
        setIsValid(true)
      })
      .catch(() => {
        setIsValid(false)
      })
  }

  return <Form
    form={pingForm}
    layout='vertical'
    onChange={onChangeForm}
  >
    <Row gutter={20}>
      <Col span={8}>
        <Form.Item
          name='name'
          label={<>
            {$t({ defaultMessage: 'Target host or IP address' })}
            <Tooltip.Question
              title={$t(EdgeTroubleshootingMessages.Target_Host_IP_TOOLTIP)}
              placement='bottom'
            />
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
            disabled={!isValid || isPingingEdge}
            onClick={handlePingEdge}>
            {$t({ defaultMessage: 'Run' })}
          </Button>
        </Form.Item>
      </Col>
    </Row>
    <Loader states={[{
      isLoading: false,
      isFetching: isPingingEdge
    }]}>
      <Form.Item
        name='result'>
        <TextArea
          style={{ resize: 'none', height: '300px' }}
          autoSize={false}
          readOnly={true}
        />
      </Form.Item>
    </Loader>
  </Form>
}

