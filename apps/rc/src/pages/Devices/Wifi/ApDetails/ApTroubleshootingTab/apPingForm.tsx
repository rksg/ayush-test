import { useRef } from 'react'
import React      from 'react'

import { Row, Col, Form, Input, FormInstance, Button } from 'antd'
import TextArea                                        from 'antd/lib/input/TextArea'
import { useIntl }                                     from 'react-intl'
import { useParams, useNavigate }                      from 'react-router-dom'

import { Loader, PageHeader, StepsForm, StepsFormInstance, Tabs, Tooltip } from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                                      from '@acx-ui/icons'
import { usePingApMutation }                                               from '@acx-ui/rc/services'
import { WifiNetworkMessages, WifiTroubleshootingMessages }                from '@acx-ui/rc/utils'
import { useTenantLink }                                                   from '@acx-ui/react-router-dom'

export function ApPingForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const { tenantId, serialNumber } = useParams()
  const basePath = useTenantLink(`/devices/aps/${serialNumber}/details/troubleshooting/`)

  const [pingAp] = usePingApMutation()
  const handlePingAp = async () => {
    try {
      const payload = {
        targetHost: '1.1.1.1'
      }

      await pingAp({ params: { tenantId, serialNumber }, payload }).unwrap()
      // navigate(`${basePath.pathname}/aps`, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }



  const [form] = Form.useForm()
  return <Form
    form={form}

    layout='vertical'

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
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
          <Button type='primary'
            htmlType='submit'
            onClick={handlePingAp}>
            Run
          </Button>
        </Form.Item>
      </Col>
    </Row>
    <Loader states={[{
      isLoading: false//venuesList.isLoading
    }]}>
      <Form.Item>
        <TextArea
          style={{ resize: 'none' }}
          autoSize={false}
          readOnly={true}
        />
      </Form.Item>
    </Loader>

  </Form>


}
function showToast (arg0: { type: string; content: string }) {
  throw new Error('Function not implemented.')
}

