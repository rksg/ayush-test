import { useRef, useState } from 'react'
import React                from 'react'


import { Row, Col, Form, Input, Button, Select } from 'antd'
import TextArea                          from 'antd/lib/input/TextArea'
import _                                 from 'lodash'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { Loader, showToast, Tooltip }  from '@acx-ui/components'
import { QuestionMarkCircleOutlined }  from '@acx-ui/icons'
import { usePingApMutation }           from '@acx-ui/rc/services'
import { targetHostRegExp, WifiTroubleshootingMessages } from '@acx-ui/rc/utils'

export function ApPacketCaptureForm () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
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
        name='captureInterface'
        label={$t({defaultMessage:'Capture Interface:'})}
        children={
          <Select
            options={[
              { label: $t({ defaultMessage: 'No model selected' }), value: null },
              // ...apModelsOptions
            ]}
            // onChange={handleModelChange}
          />
        }
        />
        <Form.Item
          name='macAddressFilter'
          label=
            {$t({ defaultMessage: 'MAC Address Filter:' })}
          rules={[
            // { validator: (_, value) => targetHostRegExp(value) }
          ]}
          validateFirst
          // hasFeedback
          children={<Input />}
        />

        <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
          <Button type='primary'
            htmlType='submit'
            disabled={!isValid || isPingingAp}
            onClick={handlePingAp}>
            Run
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

