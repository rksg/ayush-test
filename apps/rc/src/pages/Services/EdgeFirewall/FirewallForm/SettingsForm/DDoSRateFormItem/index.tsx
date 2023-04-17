import { useState } from 'react'

import { Form, Switch, Button, Typography, Row, Col } from 'antd'
import { useIntl }                                    from 'react-intl'

import { DdosRateLimitingRule } from '@acx-ui/rc/utils'

import { DDoSRateLimitConfigDrawer } from './DDoSRateLimitConfigDrawer'
import { StyledWrapper }             from './styledComponents'

export const DDoSRateFormItem = () => {
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false)

  const onChangeDDoSLimit = (checked: boolean) => {
    setDrawerVisible(checked)
  }

  return (
    <StyledWrapper>
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

      <Form.Item
        name='ddosRateLimitingRules'
        valuePropName='data'
        initialValue={[] as DdosRateLimitingRule[]}
        shouldUpdate={(prevValues, currentValues) => {
          return prevValues.ddosRateLimitingEnabled !== currentValues.ddosRateLimitingEnabled
        }}
        rules={[
          ({ getFieldValue }) => ({
            validator (_, value) {
              if (getFieldValue('ddosRateLimitingEnabled') && (!value || value.length === 0)) {
                return Promise.reject($t({ defaultMessage: 'Please create 1 rule at least.' }))
              }
              return Promise.resolve()
            }
          })
        ]}
        className='ddosRateLimitingRulesFormItem'
      >
        <DDoSRateLimitConfigDrawer
          visible={drawerVisible}
          setVisible={setDrawerVisible}
        />
      </Form.Item>
    </StyledWrapper>
  )
}