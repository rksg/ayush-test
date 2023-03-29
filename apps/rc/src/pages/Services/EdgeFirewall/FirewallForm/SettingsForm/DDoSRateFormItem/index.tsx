import { useState } from 'react'

import { Form, Switch, Button, Typography, Row, Col } from 'antd'
import { useIntl }                                    from 'react-intl'

import { DDoSRateLimitConfigDrawer } from './DDoSRateLimitConfigDrawer'

export const DDoSRateFormItem = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false)
  const ddosRateLimitingEnabled = Form.useWatch('ddosRateLimitingEnabled', form)

  const onChangeDDoSLimit = (checked: boolean) => {
    setDrawerVisible(checked)
  }

  return (
    <>
      <Row>
        <Col span={12}>
          <Typography.Text>
            {$t({ defaultMessage: 'DDoS Rate-limiting' })}
          </Typography.Text>
        </Col>
        <Col span={6}>
          <Form.Item
            name='ddosRateLimitingEnabled'
            valuePropName='checked'
          >
            <Switch
              aria-label='ddos'
              onChange={onChangeDDoSLimit}
              checkedChildren={$t({ defaultMessage: 'ON' })}
              unCheckedChildren={$t({ defaultMessage: 'OFF' })}
            />
          </Form.Item>
        </Col>

        {ddosRateLimitingEnabled &&
        <Col span={6}>
          <Button
            type='link'
            onClick={() => onChangeDDoSLimit(true)}
          >
            { $t({ defaultMessage: 'Change' }) }
          </Button>
        </Col>
        }
      </Row>

      <DDoSRateLimitConfigDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
      />
    </>
  )
}