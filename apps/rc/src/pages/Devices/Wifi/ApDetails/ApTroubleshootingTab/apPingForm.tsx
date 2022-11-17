import { useRef, useState } from 'react'
import React                from 'react'


import { Row, Col, Form, Input, Button } from 'antd'
import TextArea                          from 'antd/lib/input/TextArea'
import _                                 from 'lodash'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { Loader, showToast, Tooltip }  from '@acx-ui/components'
import { QuestionMarkCircleOutlined }  from '@acx-ui/icons'
import { usePingApMutation }           from '@acx-ui/rc/services'
import { WifiTroubleshootingMessages } from '@acx-ui/rc/utils'

export function ApPingForm () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const [form] = Form.useForm()
  const [isValid, setIsValid] = useState(false)
  const [pingAp, { isLoading: isPingingAp }] = usePingApMutation()
  const handlePingAp = async () => {
    try {
      const payload = {
        targetHost: form.getFieldValue('name')
      }

      const pingApResult = await pingAp({ params: { tenantId, serialNumber }, payload }).unwrap()
      if (pingApResult) {

        form.setFieldValue('result', _.get(pingApResult, 'response.response'))
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
    onChange={onChangeForm}
  >
    <Row gutter={20}>
      <Col span={8}>
        <Form.Item
          name='name'
          label={<>
            {$t({ defaultMessage: 'Target host or IP address' })}
            <Tooltip
              title={$t(WifiTroubleshootingMessages.Target_Host_IP_TOOLTIP)}
              placement='bottom'
            >
              <QuestionMarkCircleOutlined />
            </Tooltip>
          </>}
          rules={[
            { required: true }
          ]}
          validateFirst
          // hasFeedback
          children={<Input />}
        />
        <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
          <Button type='primary'
            htmlType='submit'
            disabled={!isValid}
            onClick={handlePingAp}>
            Run
          </Button>
        </Form.Item>
      </Col>
    </Row>
    <Loader states={[{
      isLoading: isPingingAp
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

