import { useState } from 'react'

import { Row, Col, Form, Input } from 'antd'
import TextArea                  from 'antd/lib/input/TextArea'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Button, Loader, showToast, Tooltip }            from '@acx-ui/components'
import { usePingApMutation }                             from '@acx-ui/rc/services'
import { targetHostRegExp, WifiTroubleshootingMessages } from '@acx-ui/rc/utils'

import { useApContext } from '../ApContext'

export function ApPingForm () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useApContext()
  const [pingForm] = Form.useForm()
  const [isValid, setIsValid] = useState(false)
  const [pingAp, { isLoading: isPingingAp }] = usePingApMutation()
  const handlePingAp = async () => {
    try {
      const payload = {
        targetHost: pingForm.getFieldValue('name')
      }
      const pingApResult = await pingAp({ params: { tenantId, serialNumber }, payload }).unwrap()
      if (pingApResult) {

        pingForm.setFieldValue('result', _.get(pingApResult, 'response.response'))
      }
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
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
              title={$t(WifiTroubleshootingMessages.Target_Host_IP_TOOLTIP)}
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
            type='secondary'
            htmlType='submit'
            disabled={!isValid || isPingingAp}
            onClick={handlePingAp}>
            {$t({ defaultMessage: 'Run' })}
          </Button>
        </Form.Item>
      </Col>
    </Row>
    <Loader states={[{
      isLoading: false,
      isFetching: isPingingAp
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

