import { useState } from 'react'

import { Form, Switch, Button, Typography, Row, Col } from 'antd'
import { useIntl }                                    from 'react-intl'

import { DDoSRateLimitConfigDrawer } from './DDoSRateLimitConfigDrawer'

export const DDoSRateFormItem = () => {
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false)
  // const ddosRateLimitingRules = Form.useWatch('ddosRateLimitingRules', form)

  const onChangeDDoSLimit = (checked: boolean) => {
    setDrawerVisible(checked)
  }

  return (
    <>
      <Row>
        <Col span={6}>
          <Typography.Text>
            {$t({ defaultMessage: 'DDoS Rate-limiting' })}
          </Typography.Text>
        </Col>

        <Col span={6}>
          <Form.Item
            name='ddosRateLimitingEnabled'
            label={$t({ defaultMessage: 'DDoS Rate-limiting' })}
            valuePropName='checked'
            noStyle
            initialValue={false}
          >
            <Switch
              aria-label='ddos'
              onChange={onChangeDDoSLimit}
              checkedChildren={$t({ defaultMessage: 'ON' })}
              unCheckedChildren={$t({ defaultMessage: 'OFF' })}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.ddosRateLimitingEnabled !== currentValues.ddosRateLimitingEnabled}
          >
            {({ getFieldValue }) => {
              return getFieldValue('ddosRateLimitingEnabled') && <Button
                type='link'
                onClick={() => onChangeDDoSLimit(true)}
              >
                { $t({ defaultMessage: 'Change' }) }
              </Button>
            }}
          </Form.Item>
        </Col>
      </Row>

      <DDoSRateLimitConfigDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
      />
    </>
  )
}