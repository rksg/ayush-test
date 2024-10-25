import { Col, Form, Input, Row, Space, Typography } from 'antd'
import { useIntl }                                  from 'react-intl'

import { StepsForm, useStepFormContext }                                                                                             from '@acx-ui/components'
import { MdnsProxyForwardingRulesTable, RULES_MAX_COUNT, SpaceWrapper }                                                              from '@acx-ui/rc/components'
import { EdgeMdnsProxyViewData, MdnsProxyFeatureTypeEnum, MdnsProxyForwardingRule, servicePolicyNameRegExp, transformDisplayNumber } from '@acx-ui/rc/utils'

export const SettingsForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeMdnsProxyViewData>()

  const handleSetRules = (rules: MdnsProxyForwardingRule[]) => {
    form.setFieldValue('forwardingRules', rules.map((rule, idx) => ({
      ...rule,
      ruleIndex: idx
    })))
  }

  return (
    <Row>
      <Col span={12}>
        <SpaceWrapper full direction='vertical' size={30} justifycontent='flex-start'>
          <Row>
            <Col span={18}>
              <StepsForm.Title>
                {$t({ defaultMessage: 'Settings' })}
              </StepsForm.Title>
              <Form.Item
                name='name'
                label={$t({ defaultMessage: 'Service Name' })}
                rules={[
                  { required: true },
                  { min: 2, max: 32 },
                  { validator: (_, value) => servicePolicyNameRegExp(value) }
                ]}
                validateFirst
                children={<Input />}
              />
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                name='forwardingRules'
                label={<Space direction='vertical' size={0}>
                  <Form.Item noStyle shouldUpdate>{
                    ({ getFieldValue }) => {
                      return $t({ defaultMessage: 'Forwarding Rules ({rulesCount})' },
                        // eslint-disable-next-line max-len
                        { rulesCount: transformDisplayNumber(getFieldValue('forwardingRules')?.length) })
                    }
                  }</Form.Item>
                  <Typography.Text type='secondary'>
                    {$t({ defaultMessage: 'Up to {maxCount} rules may be added' },
                      { maxCount: RULES_MAX_COUNT })}
                  </Typography.Text>
                </Space>}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please set forwarding rules' })
                }]}
                valuePropName='rules'
              >
                <MdnsProxyForwardingRulesTable
                  featureType={MdnsProxyFeatureTypeEnum.EDGE}
                  readonly={false}
                  setRules={handleSetRules}
                />
              </Form.Item>
            </Col>
          </Row>
        </SpaceWrapper>
      </Col>
    </Row>
  )
}